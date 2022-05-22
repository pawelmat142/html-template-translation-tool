import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslationElement } from '../models/translationElement';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { LanguagesService } from './languages.service';
import { ProjectService } from './project.service';
import { ReportService } from './report.service';


// STORES AND MODIFY CURRENT LOADED TEMPLATE VIEW
// - borders blue/orange = identified/translated


@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  
  private translationObs = new BehaviorSubject<string>('')
  set translation(t: string) {this.translationObs.next(t)}
  getTranslationObs() {return this.translationObs.asObservable()}

  fileAsTxt: string

  blue = '#41a4a6'
  green = '#63aa55'
  orange = '#db863b'
  
  constructor(
    private db: DataService,
    private dialog: DialogService,
    private project: ProjectService,
    private language: LanguagesService,
    private report: ReportService,
    private router: Router
  ) {}

  // ELEMENTS TRANSLATION

  translationElements: TranslationElement[] = []
  activeTranslationElement: TranslationElement

  identifiersToRemove: string[] = []

  async getTranslationElements() {
    this.translationElements = await this.db
      .getProjectTranslationDocs(this.project.name)
  }

  setActiveTranslationElement(identifier: string): void { 
    this.activeTranslationElement = this.translationElements
      .find(el => el.identifier === identifier)
  }

  async setTranslation(translations: string[], _identifier?: string): Promise<void> {
    let identifier = _identifier ? _identifier : this.activeTranslationElement.identifier
    if (this.activeTranslationElement) { 
      this.activeTranslationElement[this.language.translateTo] = translations
    }
    try {
      await this.db.updateTranslationDoc(
        this.project.name,
        identifier,
        this.language.translateTo,
        translations
      )
    } catch (error) {
      this.dialog.setDialogOnlyHeader('db: update doc error')
    }
  }

  async removeTranslation(): Promise<void> {
    this.activeTranslationElement[this.language.translateTo] = []
    try {
      await this.db.updateTranslationDoc(
        this.project.name,
        this.activeTranslationElement.identifier,
        this.language.translateTo,
        []
      )
    } catch (error) {
      this.dialog.setDialogOnlyHeader('db: update doc error')
    }
  }


  // TEMPLATE ELEMENTS IDENTIFICATION
  
  identifyElementLoop(element: Node) { 
    let childNodes = element.childNodes
    if (childNodes.length > 0) {
      childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) this.identifyTextNode(node)
        else if (node instanceof HTMLInputElement) this.identifyInputElement(node)
        else if (node instanceof HTMLTextAreaElement) this.identifyInputElement(node)
        else this.identifyElementLoop(node)
      })
    }
  }

  identifyInputElement(node: HTMLInputElement | HTMLTextAreaElement) {
    if (!node.hasAttribute('identifier')) { 
      let value = node.getAttribute('placeholder')
      if (!value) value = node.getAttribute('value')
      let type = node.getAttribute('type')
      if (value && type !== 'checkbox') { 
        let newIdentifier = this.db.newId
        node.setAttribute('identifier', newIdentifier)
        this.setBorderToElementWithIdentifier(node)
        let newTranslationElement: TranslationElement = {
          identifier: newIdentifier,
          [this.language.origin]: [value]
        }
        this.translationElements.push(newTranslationElement)
      } 
    }
  }

  identifyTextNode(node: Node): void {
    let nodeAsText = node as Text
    let txtToTranslate = nodeAsText.textContent.replace(/\s/g, '').replace(/\n/g, '')
    if (txtToTranslate) { 
      // let txtToTranslate = nodeAsText.data.replace(/\n/g, '').trim()
      // let txtToTranslate = nodeAsText.data.replace(/\n/g, '')
      let parentElement = node.parentElement
      let identifier = parentElement.getAttribute('identifier')
      if (identifier) {
        let elem: TranslationElement = this.translationElements
          .find(el => el.identifier === identifier)
        if (!elem[this.language.origin].includes(txtToTranslate)) { 
          elem[this.language.origin].push(txtToTranslate)
        }
      } else if (parentElement.tagName.toUpperCase() !== 'SCRIPT') {
        let newIdentifier = this.db.newId
        parentElement.setAttribute('identifier', newIdentifier)
        this.setBorderToElementWithIdentifier(parentElement)
        let newTranslationElement: TranslationElement = {
          identifier: newIdentifier,
          [this.language.origin]: [txtToTranslate]
        }
        this.translationElements.push(newTranslationElement)
      }
    }
  }

  async removeElementIdentifier(element: HTMLElement) {
    try {
      let identifier = element.getAttribute('identifier')
      if (identifier) {
        await this.db.deleteTranslationDoc(this.project.name, identifier)
        element.removeAttribute('identifier')
        element.style.border = ''
      }
    } catch (error) { 
      this.dialog.setDialogOnlyHeader(error.message)
    }
  }

  async removeIdentifiersToRemove(): Promise<void> {
    if (this.identifiersToRemove && this.identifiersToRemove.length) { 
      setTimeout(async () => { 
        this.identifiersToRemove.forEach(id => { 
          let element = document.querySelector(`[identifier="${id}"]`)
          if (element) element.removeAttribute('identifier')
        })
        await this.db.deleteTranslationDocuments(this.project.name, this.identifiersToRemove)
        this.dialog.clearDialog()
        this.dialog.header = 'Now you have to save the template! Identifiers removed:'
        this.identifiersToRemove.forEach(id => this.dialog.txt = id)
        this.dialog.open()
        this.identifiersToRemove = []
      }, 5000)
    }
  }


  // BORDERS 

  inititializeBorders() { 
    this.translationElements.forEach(el => { 
      let element = document.querySelector(`[identifier="${el.identifier}"]`)
      if (element) { 
        if (
          el.hasOwnProperty(this.language.translateTo) &&
          el[this.language.translateTo].length > 0
        ) { 
          this.setBorderToTranslatedElement(element)
        } else {
          this.setBorderToElementWithIdentifier(element)
        }
      }
    })
  }

  private setBorderToElementWithIdentifier(element): void {
    if (element && element.hasAttribute('identifier')) {
      element.style.border = '2px solid ' + this.blue
    }
  }

  private setBorderToTranslatedElement(element): void {
    if (element && element.hasAttribute('identifier')) {
      element.style.border = '2px solid ' + this.orange
    }
  }

  setAsTranslated(identifier: string): void { 
    let element: HTMLElement = document
      .querySelector(`[identifier="${identifier}"]`)
    if (element) { 
      this.setBorderToTranslatedElement(element)
    }
  }

  setAsNotTranslated(identifier: string): void { 
    let element: HTMLElement = document
      .querySelector(`[identifier="${identifier}"]`)
    if (element) { 
      this.setBorderToElementWithIdentifier(element)
    }
  }


  // TEMPLATE TRANSLATION PROCESS

  async translateTemplate(newContent: string) {
    let translateTo = this.language.translateTo
    let origin = this.language.origin
  
    let translations = this.translationElements
      .filter(el => el.hasOwnProperty(translateTo))
  
    let elementsWithoutTranslations = this.translationElements
      .filter(el => !el.hasOwnProperty(translateTo))

    if (elementsWithoutTranslations && elementsWithoutTranslations.length) {
      this.report.elements = elementsWithoutTranslations
      this.router.navigate(['report'])
      return
    } else {  // TRANSLATION
      let translated: string[] = []
      let toTranslate: string[] = []
      translations.forEach((el: TranslationElement) => { 
        el[origin].forEach(e => toTranslate.push(e))
        let element: HTMLElement = document.querySelector(`[identifier="${el.identifier}"]`)
        if (element) { 
            let nodes = element.childNodes
            nodes.forEach(node => { 
              if (node.nodeType === Node.TEXT_NODE) { 
                let nodeAsText = node as Text
                let str = nodeAsText.data.replace(/\s/g, '').replace(/\n/g, '')
                if (str) { 
                  let txtToChange = el[translateTo].shift()
                  node.nodeValue = txtToChange
                  translated.push(txtToChange)
                }
              }
            })
        }
      })
      console.log(toTranslate)
      console.log(translated)
    }
  }

  // async translateTemplate(newContent: string) {
  //   let translateTo = this.language.translateTo
  //   let origin = this.language.origin
  
  //   let translations = this.translationElements
  //     .filter(el => el.hasOwnProperty(translateTo))
  
  //   let elementsWithoutTranslations = this.translationElements
  //     .filter(el => !el.hasOwnProperty(translateTo))

  //   if (elementsWithoutTranslations && elementsWithoutTranslations.length) {
  //     this.report.elements = elementsWithoutTranslations
  //     this.router.navigate(['report'])
  //     return
  //   } else {  // TRANSLATION
  //     translations.forEach((el: TranslationElement) => { 
  //       let element = document.querySelector(`[identifier="${el.identifier}"]`) as HTMLElement
  //       if (element) { 
  //         if (el[origin].length === 1) {
  //           element.textContent = el[translateTo].pop()
  //         } else {
  //           let nodes = element.childNodes
  //           nodes.forEach(node => { 
  //             if (node.nodeType === Node.TEXT_NODE) { 
  //               let nodeAsText = node as Text
  //               let str = nodeAsText.data.replace(/\s/g, '').replace(/\n/g, '')
  //               if (str) { 
  //                 let txtToChange = el[translateTo].shift()
  //                 node.nodeValue = txtToChange
  //               }
  //             }
  //           })
  //         }
  //       }
  //     })

  //     console.log(translations)

  //   }
  // }

  // GENERATE TEMPLATE
  async generateTemplate(newContent: string) { 
    let result = await this.project.generateTemplate(newContent)
    this.inititializeBorders()
  }

  // OTHERS

  async saveTemplate(contentBodyAfterIdentify: string) {
    this.translationElements = this.translationElements
      .filter(el => contentBodyAfterIdentify.includes(el.identifier))
    await this.project.saveTemplate(contentBodyAfterIdentify, this.translationElements)
    this.dialog.setDialogOnlyHeader('Project saved successfully!')
    this.inititializeBorders()
  }

  unescapeHTML(escapedHTML: string): string {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
  }

}
