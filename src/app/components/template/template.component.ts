import { Component, ViewChild } from '@angular/core';
import { TemplateService } from 'src/app/services/template.service';
import { Observable } from 'rxjs';
import { LanguagesService } from 'src/app/services/languages.service';
import { DataService } from 'src/app/services/data.service';
import { ProjectService } from 'src/app/services/project.service';


// DISPLAY AND MODIFY LOADED TEMPLATE

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent {

  contentObs: Observable<string>
  content: string

  private selectedElement: HTMLElement
  private activeElement: HTMLElement

  // lista dokumentow reprezentujaca elementy wczytanego HTMLa z nadanym identifier
  // zaciagana z db w trakcie wczytywania pliku
  identifiedElements: any[] = []

  templateTxt: string

  @ViewChild('contentReference') contentRef

  constructor(
    private template: TemplateService,
    private language: LanguagesService,
    private db: DataService,
    private project: ProjectService
  ) {
    this.project.getFileTxtInitialObs().subscribe(
      txt => this.initializeTemplate(txt))

    this.template.getIdentifierObs().subscribe(data => { 
      if (data) this.setBorderToElementWithIdentifier()
      else this.removeBorder()
    })
    this.template.getActiveElementObs().subscribe(e => this.onActiveElement(e))
    this.language.getToChangeObs().subscribe(l => l.name && this.inititializeBorders())
  }

  private innerBefore = ''
  private blue = '#41a4a6'
  private green = '#63aa55'
  private orange = '#db863b'
  
  private initializeTemplate(txt: string): void {
    this.templateTxt = txt
    setTimeout(async () => { 
    // ustawia dokumenty do templateIdentifiedElements - reprezentuja elementy 
      let elementsWithIdentifier = this.contentRef.nativeElement.querySelectorAll('[identifier]')
      let identifiers: string[] = this.getIdentifiersFromNodeList(elementsWithIdentifier)
      this.identifiedElements = await this.getDocsWithIdentifier(identifiers)
    // oznacza elementy z nadanym identifier i te przetlumaczone juz do danego jezyka
      this.inititializeBorders()
    }, 3000)
  }


  // MOUSE EVENT ACTIONS

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
      this.setTranslationIfExist()
    } else { 
      this.removeStyles(this.activeElement)
      this.activeElement = null
      this.template.translation = ''
    }
  }
  

  // STYLING

  private setSelectStyles(element: HTMLElement): void {
    if (this.selectedElement) { 
      element.style.backgroundColor = '#41a4a6'
      element.style.cursor = 'pointer'
      element.style.padding = '.5em .2em'
    }
  }

  private setActiveStyles(element: HTMLElement): void {
    if (this.activeElement) { 
      element.style.backgroundColor = '#db863b'
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

  private removeBorder(): void {
    if (this.activeElement) {
      this.activeElement.style.border = ''
    }
  }

  private setBorderToElementWithIdentifier(_element?): void {
    let element = _element || this.activeElement
    if (element) {
      element.style.border = '2px solid ' + this.blue
    }
  }

  setBorderToTranslatedElement(_element?): void {
    let element = _element || this.activeElement
    if (element && element.hasAttribute('identifier')) {
      element.style.border = '2px solid ' + this.orange
    }
  }


  // INITIALIZATION

  private getIdentifiersFromNodeList(elements: NodeList): string[] {
    let result: string[] = []
    elements.forEach((el: HTMLElement) => { 
      let identifier = el.getAttribute('identifier')
      if (identifier) result.push(identifier)
    })
    return result
  }

  private async getDocsWithIdentifier(identifiers) {
    let promises = identifiers.map(identifier => 
      this.db.getDocByIdentifier(identifier, this.project.name))
    return await Promise.all(promises)
  }

  private inititializeBorders() {
    if (this.identifiedElements.length) { 
      this.identifiedElements.forEach(doc => { 
        let element = document.querySelector(`[identifier="${doc.identifier}"]`)
        if (doc.hasOwnProperty(this.language.toChange)) { 
          this.setBorderToTranslatedElement(element)
        } else {
          this.setBorderToElementWithIdentifier(element)
        }
      })
    }
  }

  private setTranslationIfExist(): void {
    let identifeir = this.activeElement.getAttribute('identifier')
    if (identifeir) {
      let doc = this.identifiedElements.find(el => el.identifier === identifeir)
      if (doc && doc.hasOwnProperty(this.language.toChange)) {
        this.template.translation = doc[this.language.toChange]
      }
    }
  }

}
