import { Component, OnInit } from '@angular/core';
import { ReadFileService } from 'src/app/services/read-file.service';
import { TemplateService } from 'src/app/services/template.service';
import { Observable } from 'rxjs';


// DISPLAY AND MODIFY LOADED TEMPLATE

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {

  contentObs: Observable<string>
  content: string

  private selectedElement: HTMLElement
  private activeElement: HTMLElement

  constructor(
    private template: TemplateService,
    private readFile: ReadFileService
  ) {

    this.contentObs = this.readFile.getTextObs()
    this.readFile.getTextObs().subscribe(c => this.content = c)

    this.template.getIdentifierObs().subscribe((data) =>
      data && this.setBorderToElementWithIdentifier())
    
    this.template.getActiveElementObs().subscribe(e => this.onActiveElement(e))
  }

  private innerBefore = ''

  
  ngOnInit(): void { }
  

  onMousemove(event: Event) {
    let element = event.target as HTMLElement;
    if (element.innerHTML !== this.innerBefore) { 
      this.innerBefore = element.innerHTML
      this.checkElement(element)
    }
  }


  private checkElement(element: HTMLElement): void {

    if (element.childNodes.length === 1 &&
      element.childNodes[0].nodeType === Node.TEXT_NODE
    ) {
      this.selectElement(element)
    }

  }


  private selectElement(element: HTMLElement): void {
    if (!this.activeElement) {
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
      this.removeStyles(element)
      this.selectedElement = null
    }
  }
  

  private clickElement(element: HTMLElement): void {
    if (this.selectedElement) {
      this.template.activeElement = element
    } else if (this.activeElement) {
      this.template.activeElement = null
    }
  }
  

  private onActiveElement(element: HTMLElement): void {
    if (element) {
      this.activeElement = element
      this.setActiveStyles(element)
      this.selectedElement = null
    } else { 
      this.removeStyles(this.activeElement)
      this.activeElement = null
    }
  }
  
  private setSelectStyles(element: HTMLElement): void {
    if (this.selectedElement) { 
      element.style.backgroundColor = '#0073aa'
      element.style.cursor = 'pointer'
      element.style.padding = '.5em .2em'
    }
  }

  private setActiveStyles(element: HTMLElement): void {
    if (this.activeElement) { 
      element.style.backgroundColor = 'tomato'
      element.style.cursor = 'pointer'
      element.style.padding = '.5em .2em'
    } 
  }

  private removeStyles(element: HTMLElement): void {
    if (element) { 
      element.style.backgroundColor = ''
      element.style.cursor = ''
      element.style.padding = ''
    }
  }



  private setBorderToElementWithIdentifier(): void {
    if (this.activeElement) {
      this.activeElement.style.border = '2px solid #0073aa'
    }
  }

  setBorderToTranslatedElement(): void {
    if (this.activeElement && this.activeElement.hasAttribute('identifier')) {
      this.activeElement.style.border = '2px solid tomato'
    }
  }

}
