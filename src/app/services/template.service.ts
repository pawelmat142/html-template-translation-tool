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
    this.translationElements = []
    let notInTemplate: string[] = []
    const translationElements = await this.db
      .getProjectTranslationDocs(this.project.name)
    translationElements.forEach(el => {
      const node = document.querySelector(`[identifier="${el.identifier}"]`)
      if (node) this.translationElements.push(el)
      else notInTemplate.push(el.identifier)
    })
    if (notInTemplate.length > 0) { 
      this.db.deleteTranslationDocuments(this.project.name, notInTemplate)
    }
  }
  
  setActiveTranslationElement(identifier: string): void { 
    this.activeTranslationElement = this.translationElements
    .find(el => el.identifier === identifier)
  }

  
  // ELEMENTS TRANSLATION
  
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

  async untranslated() { 
    let notTranslated = this.getElementsWithoutTranslations(this.language.translateTo)
    if (notTranslated && notTranslated.length > 0) {
        this.report.elements = notTranslated
        this.router.navigate(['report'])
    } else { 
      this.dialog.setDialogOnlyHeader('All elements are translated')
    }
  }
    
  // TEMPLATE TRANSLATION PROCESS

  async translateTemplate(translated: boolean): Promise<boolean> {
    let from = translated ? this.language.translateTo : this.language.origin
    let to = translated ? this.language.origin : this.language.translateTo
    
    let notTranslated = this.getElementsWithoutTranslations(to)
    if (notTranslated && notTranslated.length) {
      await this.dialog.confirmDialog('Not all elements are translated',
      'Are you sure you want to translate anyway? If not go to untranslated')
    }
     // TRANSLATION
    let translations = this.translationElements
      .filter(el => el.hasOwnProperty(this.language.translateTo))
    
    let translatedarr: string[] = []
    let toTranslate: string[] = []

    translations.forEach((el: TranslationElement) => { 
      el[from].forEach(e => toTranslate.push(e))
      let element: HTMLElement = document.querySelector(`[identifier="${el.identifier}"]`)
      if (element) {
        if (element.tagName.toLocaleLowerCase() === 'img' ||
          element.tagName.toLocaleLowerCase() === 'amp-img')
        {
          let txtToChange = el[to][0]
          console.log(txtToChange)
          element.setAttribute('alt', txtToChange)
          translatedarr.push(txtToChange)
        } else if (element.tagName.toLocaleLowerCase() === 'meta') {
          let txtToChange = el[to][0]
          element.setAttribute('content', txtToChange)
          translatedarr.push(txtToChange)
        } else {
          let nodes = element.childNodes
          nodes.forEach((node, i) => { 
            if (node.nodeType === Node.TEXT_NODE) {
              let nodeAsText = node as Text
              let str = nodeAsText.data.replace(/\s/g, '').replace(/\n/g, '')
              if (str) {
                let txtToChange = el[to][i]
                node.nodeValue = txtToChange
                translatedarr.push(txtToChange)
              }
            }
          })
        }
      }
    })
    console.log(toTranslate)
    console.log(translatedarr)
    return translated ? false : true
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

  removeIdentifiersToRemove(): void {
    this.identificator.removeIdentifiersToRemove(this.project.name)
  }

  // borders
  initBorders(): void {this.borders.init(this.translationElements)}
  setAsTranslated(identifier: string) {this.borders.setAsTranslated(identifier)}
  setAsNotTranslated(identifier: string) {this.borders.setAsNotTranslated(identifier)}


  // OTHERS

  private getElementsWithoutTranslations(translateToLanguage: string): TranslationElement[] { 
    return this.translationElements.filter(el => !el.hasOwnProperty(translateToLanguage))
  }

  async saveTemplate(file: File) {
    await this.project.saveTemplate(file, this.translationElements)
    this.dialog.setDialogOnlyHeader('Project saved successfully!')
  }

  unescapeHTML(escapedHTML: string): string {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
  }

  head(): void {
    let elementsToTranslate: TranslationElement[] = []
    this.translationElements.forEach(el => {
      let a: HTMLElement = document.querySelector(`[identifier="${el.identifier}"]`)
      if (a && a.tagName.toLocaleLowerCase() === 'meta') {
        if (!el.hasOwnProperty(this.language.translateTo)) { 
          elementsToTranslate.push(el)
          this.report.elements = elementsToTranslate
          this.router.navigate(['report'])
        }
      }
    })
  }
}
