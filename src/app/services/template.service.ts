import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationElement } from '../models/translationElement';
import { Borders } from '../modules/borders';
import { Identificator } from '../modules/identificator';
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
  
  fileAsTxt: string

  identificator: Identificator
  borders: Borders

  
  constructor(
    private db: DataService,
    private dialog: DialogService,
    private project: ProjectService,
    private report: ReportService,
    private router: Router,
    private language: LanguagesService,
  ) {
    this.borders = new Borders(this.language)
    this.identificator = new Identificator(
      this.translationElements,
      this.db,
      this.dialog,
      this.language
    )
  }
  
  _reference: HTMLElement
  get reference(): HTMLElement { return this._reference }
  set reference(el: HTMLElement) {
    this._reference = el
    this.identificator.templateReference = el
  }
    
  translationElements: TranslationElement[] = [] //filled when template is initialized
  activeTranslationElement: TranslationElement  

  async initTranslationElements(): Promise<void> {
    this.translationElements = await this.db
      .getProjectTranslationDocs(this.project.name)
  }
  
  // ELEMENTS TRANSLATION

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
          console.log(element.tagName)
          if (element.tagName.toLocaleLowerCase() === 'img' ||
            element.tagName.toLocaleLowerCase() === 'amp-img')
          {
            let txtToChange = el[translateTo].shift()
            console.log(txtToChange)
            element.setAttribute('alt', txtToChange)
            translated.push(txtToChange)
          } else {
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
        }
      })
      console.log(toTranslate)
      console.log(translated)
    }
  }

  translateImages(): void {
    let elementsToTranslate: TranslationElement[] = []
    this.translationElements.forEach(el => {
      let a: HTMLElement = document.querySelector(`[identifier="${el.identifier}"]`)
      if (a && a.hasAttribute('alt')) {
        if (
          !el.hasOwnProperty(this.language.translateTo) ||
          el[this.language.translateTo] === ''
        ) {
          elementsToTranslate.push(el)
        }
      }
    })
    if (elementsToTranslate.length > 0) {
      this.report.elements = elementsToTranslate
      this.router.navigate(['report'])
    } else { 
      this.dialog.setDialogOnlyHeader('No more img alts to translate')
    }
  }


  // identificator
  identify(content: Node): void {
    let newElements = this.identificator
      .identify(content, this.translationElements)
    this.translationElements.push(...newElements)
    this.borders.init(this.translationElements)
  }
  setIdentifiersToRemove(identifiers: string[]): void {
    this.identificator.identifiersToRemove = identifiers
  }
  async removeElementIdentifier(element: HTMLElement): Promise<void>  {
    this.identificator.removeElementIdentifier(element, this.project.name)
  }

  // borders
  initBorders(): void {this.borders.init(this.translationElements)}
  setAsTranslated(identifier: string) {this.borders.setAsTranslated(identifier)}
  setAsNotTranslated(identifier: string) {this.borders.setAsNotTranslated(identifier)}


  // OTHERS

  async saveTemplate(contentBodyAfterIdentify: string) {
    this.translationElements = this.translationElements
      .filter(el => contentBodyAfterIdentify.includes(el.identifier))
    await this.project.saveTemplate(contentBodyAfterIdentify, this.translationElements)
    this.dialog.setDialogOnlyHeader('Project saved successfully!')
    this.borders.init(this.translationElements)
  }

  unescapeHTML(escapedHTML: string): string {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
  }
}
