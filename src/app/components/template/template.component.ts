import { Component, OnInit } from '@angular/core';
import { Language } from 'src/app/models/language';
import { LanguagesService } from 'src/app/services/languages.service';
import { TemplateService } from 'src/app/services/template.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {

  content: string = '';

  constructor(private template: TemplateService) {
    this.subscribeContent()
    this.subscribeStringToTranslate()
    this.subscribeIdentifier()
  }

  ngOnInit(): void {
  }

  private innerBefore = ''

  private isElementActive = false

  private activeElement: HTMLElement | null = null

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
    ) { this.selectElement(element) }

    // if (element.childNodes.length > 1) { 
    //   let txtChildNodes: Node[] = []
    //   element.childNodes.forEach(child => { 
    //     if (child.nodeType === Node.TEXT_NODE) {
    //       txtChildNodes.push(child)
    //     }
    //   })
    // }
  }


  private selectElement(element: HTMLElement): void {
    this.setSelectStyles(element)
    
    element.onmouseleave = () => this.removeStyles()
    element.onclick = () => this.activateElement(element)
  }
  
  
  private setSelectStyles(element: HTMLElement): void {
    if (!this.isElementActive) { 
      this.activeElement = element
      element.style.backgroundColor = '#0073aa'
      element.style.cursor = 'pointer'
      element.style.padding = '.5em .2em'
    }
  }
  
  
  private setActiveStyles(element: HTMLElement): void {
    if (!this.isElementActive) { 
      element.style.backgroundColor = 'tomato'
      element.style.cursor = 'pointer'
      element.style.padding = '.5em .2em'
    } 
  }

  

  private removeStyles(): void {
    if (!this.isElementActive) {
      let element = this.activeElement as HTMLElement
      element.style.backgroundColor = ''
      element.style.cursor = ''
      element.style.padding = ''
    }
  }


  private activateElement(element: HTMLElement): void {
    if (!this.isElementActive) {
      this.setActiveStyles(element)
      this.isElementActive = true
      this.template.setElement(element)
    } else { 
      this.isElementActive = false
      this.removeStyles()
      this.template.clearElement()
    }
  }


  setBorderToActiveElement(): void {
    if (this.activeElement && this.activeElement.hasAttribute('identifier')) {
      this.activeElement.style.border = '2px solid #0073aa'
    }
  }

  setBorderToTranslatedElement(): void {
    if (this.activeElement && this.activeElement.hasAttribute('identifier')) {
      this.activeElement.style.border = '2px solid tomato'
    }
  }


  generateTemplateEvent(): void {
    this.template.generateTemplate(this.content)
  }



  
  private subscribeContent(): void {
    this.template.getTxt().subscribe(
      (data) => {
        this.content = data as string
      },
      (error) => console.log(error)
    )
  }


  private subscribeStringToTranslate(): void {
    this.template.getStringToTranslate().subscribe(
      (data) => { 
        if (!data) {
          this.isElementActive = false
          this.removeStyles()
        }
      },
      (error) => console.log(error)
    )
  }


  private subscribeIdentifier(): void {
    this.template.getIdentifier().subscribe(
      (data) => { 
        if (data) {
          this.setBorderToActiveElement()
        }
      }
    )
  }

}
