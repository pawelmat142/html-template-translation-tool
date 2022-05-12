import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, catchError} from 'rxjs';
import { TemplateComponent } from '../components/template/template.component';
import { Language } from '../models/language';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { LanguagesService } from './languages.service';
import { ReadFileService } from './read-file.service';


// STORES AND MODIFY CURRENT LOADED TEMPLATE VIEW

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private activeElementObs = new BehaviorSubject<HTMLElement>(null)
  private _activeElement: HTMLElement 
  
  private identifierObs = new BehaviorSubject<string>('')
  private _identifier: string


  private stringToTranslateObs = new BehaviorSubject<string>('')
  private _stringToTranslate: string = ''

  constructor(
    private db: DataService,
    private readFile: ReadFileService,
    private dialog: DialogService,
  ) {

    this.activeElementObs.subscribe(e => this.onActiveElement(e))
  }

  // ACTIVE ELEMENT

  get activeElement(): HTMLElement {
    return this._activeElement
  }

  set activeElement(e: HTMLElement) {
    this.activeElementObs.next(e)
  }

  getActiveElementObs(): Observable<HTMLElement> { 
    return this.activeElementObs.asObservable()
  }

  onActiveElement(element: HTMLElement): void {
    this._activeElement = element
    if (element) {
      this.setIdentifierIfExist(element)
      let txt = this.unescapeHTML(element.innerHTML)
      this.stringToTranslate = txt
    } else {
      this.stringToTranslateObs.next('')
    }
  }


  // STRING TO TRANSLATE
  get stringToTranslate(): string {
    return this._stringToTranslate
  }

  set stringToTranslate(s: string) {
    this.stringToTranslateObs.next(s)
    this._stringToTranslate = s
  }

  getStringToTranslateObs(): Observable<string> { 
    return this.stringToTranslateObs.asObservable()
  }



  // IDENTIFIER
  get identifier(): string {
    return this._identifier
  }

  getIdentifierObs(): Observable<string> {
    return this.identifierObs.asObservable()
  }

  set identifier(i: string) {
    this.identifierObs.next(i)
    this._identifier = i
    console.log('set identifier ' + i)
  }

  async addIdentifierToElement() {
    if (this.activeElement) {

      let atrrtibute = this.activeElement.getAttribute('identifier')
      if (!atrrtibute) {
        let identifier = (await this.db
          .addElementIdentifier(this.stringToTranslate))
          .toString()
        
        if (identifier) {
          let modified:boolean = await this.addIdentifierToReadFile(identifier)
          if (modified) {
            this.identifier = identifier
            this.activeElement.setAttribute('identifier', identifier)
          } else this.identifier = ''
        } else this.identifier = ''
      }
    }
  }


  private async addIdentifierToReadFile(identifier: string): Promise<boolean> {
    let styles = this.activeElement.getAttribute('style')
    this.activeElement.removeAttribute('style')
    let elementAsTxt = this.unescapeHTML(await this.activeElement.outerHTML)
    this.activeElement.setAttribute('style', styles)
    let readFile = this.unescapeHTML(this.readFile.text)
    if (readFile.includes(elementAsTxt)) {
      let newElementAsText = elementAsTxt.replace('>', ` identifier="${identifier}">`) 
      let newReadFile = readFile.replace(elementAsTxt, newElementAsText)
      if (readFile !== newReadFile) {
        this.readFile.text = newReadFile
        this.setDialogIdentifierAdded()
        return true
      } else throw new Error('replacing error')
    } else throw new Error('didnt find this part')
  }


  
    

  private unescapeHTML(escapedHTML: string): string {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
  }


  private setIdentifierIfExist(element: HTMLElement): void {
    let identifier = element.getAttribute('identifier')
    if (identifier) {
      this.identifier = identifier
    } else { 
      this.identifier = ''
    }
  }

  private setDialogIdentifierAdded(): void {
    this.dialog.clearDialog()
    this.dialog.header = "Identifier added!"
    this.dialog.open()
  }
  
}
