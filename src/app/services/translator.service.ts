import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationElement } from '../models/translationElement';
import { DialogService } from './dialog.service';
import { LanguagesService } from './languages.service';
import { ReportService } from './report.service';

// TEMPLATE TRANSLATION LOGIC

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  
  private translationElements: TranslationElement[]
  private notTranslated: TranslationElement[]

  private from: string
  private to: string
  
  private textsToTranslate: string[]
  private textsTranslated: string[]

  private reference: HTMLElement

  constructor(
    private language: LanguagesService,
    private report: ReportService,
    private router: Router,
    private dialog: DialogService
  ) { }

  set(arr: TranslationElement[]): void {
    this.translationElements = arr;
  }
  setReference(ref: HTMLElement) { 
    this.reference = ref
  }
  clearElements(): void {
    this.translationElements = []
  }

  async translateTemplate(translated: boolean): Promise<boolean> {
    this.checkElements()
    if (translated) this.setLanguagesOposite()
    else this.setLanguages()

    this.getElementsWithoutTranslations()
    if (this.notTranslated && this.notTranslated.length) {
      await this.dialog.confirmDialog('Not all elements are translated',
        'Are you sure you want to translate anyway? If not go to untranslated')
    }
    this.filterElementsOnlyWithTranslations()

    this.translationLoop()

    if (!translated) {
      console.log(this.textsToTranslate)
      console.log(this.textsTranslated)
    }
    return translated ? false : true
  }


  private translationLoop(): void {
    this.textsToTranslate = []
    this.textsTranslated = []
    this.translationElements.forEach(e => {

      this.textsToTranslate.push(e[this.from])

      const elem: HTMLElement = this.reference
        .querySelector(`[identifier="${e.identifier}"]`)
      
      if (elem) { 
        if (this.isImg(elem)) this.translateImgElement(elem, e)
        else if (this.isMeta(elem)) this.translateMetaElement(elem, e) 
        else this.translateTexts(elem, e)
      }
    })
  }

  // CHECKING
  
  private isImg(elem: HTMLElement): boolean {
    if (elem.tagName.toLocaleLowerCase() === 'img' || elem.tagName.toLocaleLowerCase() === 'amp-img') { 
      return true
    } else return false
  }

  private isMeta(elem: HTMLElement): boolean {
    if (elem.tagName.toLocaleLowerCase() === 'meta') { 
      return true
    } else return false
  }


  // DOM TRANSLATIONS

  private translateImgElement(elem: HTMLElement, e: TranslationElement): void { 
    let txtToChange = e[this.to][0]
    elem.setAttribute('alt', txtToChange)
    this.textsTranslated.push(txtToChange)
  }

  private translateMetaElement(elem: HTMLElement, e: TranslationElement): void { 
    let txtToChange = e[this.to][0]
    elem.setAttribute('content', txtToChange)
    this.textsTranslated.push(txtToChange)
  }

  private translateTexts(elem: HTMLElement, e: TranslationElement): void {
    const nodes = elem.childNodes
    nodes.forEach((node, i) => { 
      if (node.nodeType === Node.TEXT_NODE) {
        let nodeAsText = node as Text
        let str = nodeAsText.data.replace(/\s/g, '').replace(/\n/g, '')
        if (str) {
          let txtToChange = e[this.to][i]
          node.nodeValue = txtToChange
          this.textsTranslated.push(txtToChange)
        }
      }
    })
  }


  // GO TO REPORT PAGE

  headElements(): void {
    this.setLanguages()
    if (this.translationElements && this.translationElements.length > 0) { 
      let elementsToTranslate: TranslationElement[] = []
      this.translationElements.forEach(el => {
        let a: HTMLElement = document.querySelector(`[identifier="${el.identifier}"]`)
        if (a && a.tagName.toLocaleLowerCase() === 'meta') {
          elementsToTranslate.push(el)
          this.report.elements = elementsToTranslate
          this.report.purpose = 'headElements'
          this.router.navigate(['report'])
        }
      })
    } else throw new Error('no elements loaded')
  }

  imagesElements(): void {
    this.setLanguages()
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
      this.report.purpose = 'imgElements'
      this.router.navigate(['report'])
    } else { 
      this.dialog.setDialogOnlyHeader('No more img alts to translate')
    }
  }

  untranslated() { 
    this.setLanguages()
    let notTranslated = this.getElementsWithoutTranslations()
    if (notTranslated && notTranslated.length > 0) {
      this.report.elements = notTranslated
      this.report.purpose = 'untranslated'
      this.router.navigate(['report'])
    } else { 
      this.dialog.setDialogOnlyHeader('All elements are translated')
    }
  }


  // OTHERS

  private filterElementsOnlyWithTranslations(): void {
    this.translationElements = this.translationElements
      .filter(el => el.hasOwnProperty(this.to))
  }

  private getElementsWithoutTranslations(): TranslationElement[] { 
    this.notTranslated = this.translationElements
      .filter(el => !el.hasOwnProperty(this.to))
    return this.notTranslated
  }

  private checkElements(): boolean { 
    if (this.translationElements && this.translationElements.length > 0) {
      return true
    } else throw new Error('no elements loaded')
  }

  private setLanguages(): void {
    if (this.language.translateTo) { 
      this.from = this.language.origin
      this.to = this.language.translateTo
    } else throw new Error("language not selected")
  }

  private setLanguagesOposite(): void {
    if (this.language.translateTo) { 
      this.from = this.language.translateTo
      this.to = this.language.origin
    } else throw new Error("language not selected")
  }
}
 