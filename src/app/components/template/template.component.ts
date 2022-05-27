import { Component, ElementRef, OnDestroy, OnInit, Output, ViewChild, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { TemplateService } from 'src/app/services/template.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { ProjectService } from 'src/app/services/project.service';
import { TranslationElement } from 'src/app/models/translationElement';

// DISPLAY AND MODIFY LOADED TEMPLATE

@Component({
  selector: 'app-template',
  template: `<div #contentRef>before initialization !</div>`,
  // styleUrls: ['./template.component.css']
  styleUrls: []
})
export class TemplateComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('contentRef') contentRef: ElementRef<HTMLElement>

  @Output() identifier = new EventEmitter<string>()
  @Output() originTexts = new EventEmitter<string[]>()
  @Output() translateToTexts = new EventEmitter<string[]>()

  private selectedElement: HTMLElement
  private activeElement: HTMLElement

  constructor(
    private template: TemplateService,
    private language: LanguagesService,
    private project: ProjectService,
  ) {}
  
  ngOnInit() {
    this.project.getTemplateObs().subscribe(t => this.initializeTemplate(t))
    this.language.getTranslateToObs()
      .subscribe(l => l.name && this.template.initBorders())
    this.project.initTemplateObs()
    setTimeout(() => {
      this.template.identificator
        .removeIdentifiersToRemove(this.project.name)
    }, 5000)
  }

  ngAfterViewInit(): void {
    this.template.reference = this.contentRef.nativeElement
  }

  ngOnDestroy(): void {
    
  }
    
  // TEMPLATE INITIALIZATION 
  
  private async initializeTemplate(fileAsTxt: string) {
    this.contentRef.nativeElement.innerHTML = fileAsTxt
    await this.template.initTranslationElements()
    this.template.initBorders()
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
        this.identifier.emit(identifier)
        this.template.setActiveTranslationElement(identifier)
        if (this.template.activeTranslationElement.hasOwnProperty(this.language.origin)) {
          this.originTexts.emit(this.template.activeTranslationElement[this.language.origin])
        }
        if (this.template.activeTranslationElement.hasOwnProperty(this.language.translateTo)) {
          this.translateToTexts.emit(this.template.activeTranslationElement[this.language.translateTo])
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
    this.identifier.emit('')
    this.originTexts.emit([])
    this.translateToTexts.emit([])
    this.innerBefore = ''
  }
  
  private removeListeners(element: HTMLElement) { 
    if (element) { 
      let newElement = element.cloneNode(true)
      element.parentNode?.replaceChild(newElement, element)
    }
  }

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

  
  // FROM TOOL COMPONENT - buttons

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
    this.template.identify(content)
  }

  unselect(): void {
    this.deactivate(this.activeElement)
  }

  generateTemplate() {
    this.contentRef.nativeElement.querySelectorAll('[style]')
      .forEach(el => el.removeAttribute('style'))
    this.contentRef.nativeElement.querySelectorAll('[identifier]')
      .forEach(el => el.removeAttribute('identifier'))
    let newContent = this.getContentBody()
    this.project.generateTemplate(newContent)
  }
  
  translateTemplate() { 
    let newContent = this.getContentBody()
    this.template.translateTemplate(newContent)
  }
  
  
  // OTHERS

  getTranslationElement(identifier: string): TranslationElement { 
    return this.template.translationElements.find(e => e.identifier === identifier)
  }

  private getContentBody() { 
    return this.contentRef.nativeElement.innerHTML
      .split('<!-- bodyslicer -->')[1]
  }
}
