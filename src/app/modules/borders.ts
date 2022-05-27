import { TranslationElement } from "../models/translationElement";
import { LanguagesService } from "../services/languages.service";

// sets borders to identified/ translated elements

export class Borders { 

  blue = '#41a4a6'
  green = '#63aa55'
  orange = '#db863b'

  constructor(
    private language: LanguagesService
  ) { }
  
  init(translationElements: TranslationElement[]): void {
    translationElements.forEach(el => { 
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

  private removeBorder(element): void {
    if (element && element.style.border) {
      element.style.border = null
    }
  }

  removeAll(): void {
    let identifiedElements = document.querySelectorAll('[identifier]')
    identifiedElements.forEach(this.removeBorder)
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
}