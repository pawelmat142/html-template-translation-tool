import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TemplateService } from 'src/app/services/template.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { ProjectService } from 'src/app/services/project.service';
import { TranslationElement } from 'src/app/models/translationElement';
import { DomSanitizer } from '@angular/platform-browser';
import { ToolComponent } from '../tool/tool.component';


// DISPLAY AND MODIFY LOADED TEMPLATE

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit, OnDestroy{

  @ViewChild(ToolComponent) tools: ToolComponent

  // tool component binding
  identifier: string
  originTexts: string[]
  translateToTexts: string[]

  templateTxt: any

  @ViewChild('contentReference')
  private contentRef: ElementRef

  private selectedElement: HTMLElement
  private activeElement: HTMLElement

  constructor(
    private template: TemplateService,
    private language: LanguagesService,
    private project: ProjectService,
    private domSanitizer: DomSanitizer,
  ) {
    this.project.getTemplateObs().subscribe(
      body => this.initializeTemplate(body))
  
    this.language.getTranslateToObs()
      .subscribe(l => l.name && this.template.inititializeBorders())
  }
  
  ngOnInit() {
    this.project.initTemplateObs()
    this.template.removeIdentifiersToRemove()
  }
  
  ngOnDestroy() {}

  // TEMPLATE INITIALIZATION 

  private async initializeTemplate(fileAsTxt: string) {
    this.templateTxt =  this.domSanitizer.bypassSecurityTrustHtml(fileAsTxt)
    await this.template.getTranslationElements()
    this.template.inititializeBorders()
  }

  // MOUSE EVENT ACTIONS

  private innerBefore = ''

  onMousemove(target: EventTarget) {
    let element = target as HTMLElement
    if (element.innerHTML !== this.innerBefore) { 
      let identifier = element.getAttribute('identifier')
      if (identifier) { 
        this.innerBefore = element.innerHTML
        this.checkElement(element)
      }
    }
  }
  
  private checkElement(element: HTMLElement): void {
    let childNodes = element.childNodes
    if (childNodes.length > 0) {
      for (let i = 0; i < childNodes.length; i++) { 
        if (childNodes[i].nodeType === Node.TEXT_NODE) {
          this.selectElement(childNodes[i].parentElement)
          break
        } else if (
          childNodes[i] instanceof HTMLInputElement ||
          childNodes[i] instanceof HTMLTextAreaElement
        ) {
          this.selectElement(childNodes[i] as HTMLElement)
          break
        } else this.checkElement(childNodes[i] as HTMLElement)
      }
    }
  }

  private selectElement(element: HTMLElement): void {
    if (!this.activeElement) {
      this.removeStyles(this.selectedElement)
      this.removeListeners(this.selectedElement)
      this.selectedElement = element
      this.setSelectStyles(element)
      element.onmouseleave = () => this.onElementLeave(element)
      element.onclick = ($event: Event) => {
        $event.preventDefault()
        this.clickElement(element)
      }
    }
  }

  private onElementLeave(element: HTMLElement): void {
    if (this.selectedElement) {
      this.selectedElement = null
      this.innerBefore = ''
      this.removeStyles(element)
      this.removeListeners(element)
    }
  }
  
  private clickElement(element: HTMLElement): void {
    if (this.activeElement) this.deactivate()
    else if (this.selectedElement) this.activate(element)
  }
  
  activate(element?: HTMLElement): void {
    if (element) {
      this.activeElement = element
      this.selectedElement = null
      this.setActiveStyles(element)
      let identifier = element.getAttribute('identifier')
      if (identifier) {
        this.identifier = identifier
        this.template.setActiveTranslationElement(identifier)
        let originLanguage = this.language.origin
        if (this.template.activeTranslationElement.hasOwnProperty(originLanguage)) {
          this.originTexts = this.template.activeTranslationElement[originLanguage]
        }
        let translateTo = this.language.translateTo
        if (this.template.activeTranslationElement.hasOwnProperty(translateTo)) {
          this.translateToTexts = this.template.activeTranslationElement[translateTo]
        } 
      }
    }
  }

  deactivate(_element?: HTMLElement) {
    let element = _element ? _element : this.activeElement
    this.removeStyles(element)
    this.removeListeners(element)
    this.activeElement = null
    this.selectedElement = null
    this.identifier = ''
    this.originTexts = []
    this.translateToTexts = []
    this.innerBefore = ''
  }
  
  private removeListeners(element: HTMLElement) { 
    if (element) { 
      let newElement = element.cloneNode(true)
      element.parentNode?.replaceChild(newElement, element)
    }
  }

  // STYLING

  private setSelectStyles(element: HTMLElement): void {
    if (this.selectedElement) { 
      element.style.backgroundColor = '#41a4a6'
      element.style.cursor = 'pointer'
    }
  }
  
  private setActiveStyles(element: HTMLElement): void {
    if (this.activeElement) { 
      element.style.backgroundColor = '#db863b'
      element.style.cursor = 'pointer'
    } 
  }

  private removeStyles(element: HTMLElement): void {
    if (element) { 
      element.style.backgroundColor = ''
      element.style.cursor = ''
    }
  }

  
  // FROM TOOL COMPONENT

  removeIdentifier() { 
    this.template.removeElementIdentifier(this.activeElement)
  }

  async saveTemplate() {
    this.contentRef.nativeElement.querySelectorAll('[style]')
      .forEach(el => el.removeAttribute('style'))
    let contentBodyAfterIdentify = this.getContentBody()
    this.template.saveTemplate(contentBodyAfterIdentify)
  }

  async autoIdentify() {
    let content = this.contentRef.nativeElement as Node
    this.template.identifyElementLoop(content)
  }

  unselect(): void {
    this.deactivate(this.activeElement)
  }

  generateTemplate() {
    this.contentRef.nativeElement.querySelectorAll('[style]')
      .forEach(el => el.removeAttribute('style'))
    let newContent = this.getContentBody()
    this.template.generateTemplate(newContent)
  }
  
  translateTemplate() { 
    let newContent = this.getContentBody()
    this.template.translateTemplate(newContent)
  }
  
  
  // OTHERS

  getTranslationElement(identifier: string): TranslationElement { 
    return this.template.translationElements.find(e => e.identifier === identifier)
  }

  private getIdentifiersFromNodeList(elements: NodeList): string[] {
    let result: string[] = []
    elements.forEach((el: HTMLElement) => { 
      let identifier = el.getAttribute('identifier')
      if (identifier) result.push(identifier)
    })
    return result
  }

  private setTranslationIfExist(): void {
    let identifeir = this.activeElement.getAttribute('identifier')
    if (identifeir) {
      let element = this.template.translationElements
        .find(el => el.identifier === identifeir)
      if (element && element.hasOwnProperty(this.language.translateTo)) {
        this.template.translation = element[this.language.translateTo]
      }
    }
  }

  private getContentBody() { 
    return this.contentRef.nativeElement.innerHTML
      .split('<!-- bodyslicer -->')[1]
  }
}
