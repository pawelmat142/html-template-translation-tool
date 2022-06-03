import { Injectable } from '@angular/core';
import { TranslationElement } from '../models/translationElement';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { LanguagesService } from './languages.service';

const METADATAS = [
  'description'
]

const AVOID = [
  'SCRIPT',
  'LINK',
  'NOSCRIPT',
  'STYLE'
]

@Injectable({
  providedIn: 'root'
})
export class IdentificatorService {
  
  translationElements: TranslationElement[]

  blue = '#41a4a6'
  green = '#63aa55'
  orange = '#db863b'
  templateReference: HTMLElement

  constructor(
    private language: LanguagesService,
    private db: DataService,
    private dialog: DialogService,
  ) { console.log('identificator init') }


  identify(contentToIdentify: Node, translationElements: TranslationElement[]): TranslationElement[] { 
    this.translationElements = translationElements
    this.identifyHead(contentToIdentify as HTMLElement)
    this.identifyImages()
    this.identifyLoop(contentToIdentify)
    return this.translationElements
  }

  private identifyLoop(contentToIdentify: Node) {
    let childNodes = contentToIdentify.childNodes
    if (childNodes.length > 0) {
      childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) this.identifyTextNode(node)
        else if (node instanceof HTMLInputElement) this.identifyInputElement(node)
        else if (node instanceof HTMLTextAreaElement) this.identifyInputElement(node)
        else this.identifyLoop(node)
      })
    } 
  }

  private identifyTextNode(node: Node): void {
    let nodeAsText = node as Text
    let str = nodeAsText.textContent.replace(/\s/g, '').replace(/\n/g, '')
    if (str) { 
      // let txtToTranslate = nodeAsText.data.replace(/\n/g, '').trim()
      let txtToTranslate = nodeAsText.data.replace(/\n/g, '')
      let parentElement = node.parentElement
      let identifier = parentElement.getAttribute('identifier')
      if (identifier) {
        let elem: TranslationElement = this.translationElements
        .find(el => el.identifier === identifier)
        if (!elem[this.language.origin].includes(txtToTranslate)) { 
          elem[this.language.origin].push(txtToTranslate)
        }
      } else if (!AVOID.includes(parentElement.tagName.toUpperCase())) {
        let newIdentifier = this.db.newId
        parentElement.setAttribute('identifier', newIdentifier)
        let newTranslationElement: TranslationElement = {
          identifier: newIdentifier,
          [this.language.origin]: [txtToTranslate]
        }
        this.translationElements.push(newTranslationElement)
      }
    }
  }


  private identifyInputElement(node: HTMLInputElement | HTMLTextAreaElement) {
    if (!node.hasAttribute('identifier')) { 
      let value = node.getAttribute('placeholder')
      if (!value) value = node.getAttribute('value')
      let type = node.getAttribute('type')
      if (value && type !== 'checkbox') { 
        let newIdentifier = this.db.newId
        node.setAttribute('identifier', newIdentifier)
        let newTranslationElement: TranslationElement = {
          identifier: newIdentifier,
          [this.language.origin]: [value]
        }
        this.translationElements.push(newTranslationElement)
      } 
    }
  }

  private identifyImages(): void {
    this.translationElements = []
    this.templateReference
      .querySelectorAll('amp-img')
      .forEach(el => this.identifyImgElement(el as HTMLElement))
    this.templateReference
      .querySelectorAll('img')
      .forEach(el => this.identifyImgElement(el as HTMLElement))
  }

  private identifyImgElement(img: HTMLElement) { 
    if (!img.hasAttribute('identifier')) {
      let alt = img.getAttribute('alt')
      if (alt) { 
        let newIdentifier = this.db.newId
        img.setAttribute('identifier', newIdentifier)
        let newTranslationElement: TranslationElement = {
          identifier: newIdentifier,
          [this.language.origin]: [alt]
        }
        this.translationElements.push(newTranslationElement)
      }
    }
  }

  async removeElementIdentifier(element: HTMLElement, projectName: string) {
    try {
      let identifier = element.getAttribute('identifier')
      if (identifier) {
        await this.db.deleteTranslationDoc(projectName, identifier)
        element.removeAttribute('identifier')
        element.style.border = ''
      }
    } catch (error) { 
      this.dialog.setDialogOnlyHeader(error.message)
    }
  }

  identifiersToRemove: string[] = []

  async removeIdentifiersToRemove(projectName: string): Promise<void> {
    if (this.identifiersToRemove && this.identifiersToRemove.length) { 
      console.log('removeIdentifiersToRemove')
      console.log(this.identifiersToRemove)
      this.identifiersToRemove.forEach(id => { 
        let element = document.querySelector(`[identifier="${id}"]`)
        if (element) element.removeAttribute('identifier')
      })
      await this.db.deleteTranslationDocuments(projectName, this.identifiersToRemove)
      this.dialog.clearDialog()
      this.dialog.header = 'Now you have to save the template! Identifiers removed:'
      this.identifiersToRemove.forEach(id => this.dialog.txt = id)
      this.dialog.open()
      this.identifiersToRemove = []
    }
  }

  async removeAll(projectName): Promise<void> {
    try { 
      let identifiedElements = document.querySelectorAll('[identifier]')
      identifiedElements.forEach(element => { 
        if (element.hasAttribute('identifier')) {
          this.identifiersToRemove.push(element.getAttribute('identifier'))
          element.removeAttribute('identifier')
        }
      })
      await this.db.deleteTranslationDocuments(projectName, this.identifiersToRemove)
      this.identifiersToRemove = []
    } catch (error) { console.log(error.message) }
  }

  identifyHead(node: HTMLElement): void {
    const nodeList = node.querySelectorAll('meta')
    nodeList.forEach(n => {
      const attribute = n.getAttribute('name')
      if (attribute && METADATAS.includes(attribute)) { 
        const content = n.getAttribute('content')
        if (content) { 
          const newIdentifier = this.db.newId
          n.setAttribute('identifier', newIdentifier)
          let newTranslationElement: TranslationElement = {
            identifier: newIdentifier,
            [this.language.origin]: [content]
          }
          this.translationElements.push(newTranslationElement)
        }
      }
    })
  }
}
