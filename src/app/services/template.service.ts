import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, catchError} from 'rxjs';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { LanguagesService } from './languages.service';
import { ProjectService } from './project.service';
import { ReadFileService } from './read-file.service';


// STORES AND MODIFY CURRENT LOADED TEMPLATE VIEW

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  
  private activeElementObs = new BehaviorSubject<HTMLElement>(null)
  private _activeElement: HTMLElement 
  get activeElement() { return this._activeElement }
  getActiveElementObs() { return this.activeElementObs.asObservable() }
  set activeElement(e: HTMLElement) {
    this.activeElementObs.next(e)
    this._activeElement = e
  }
  
  private identifierObs = new BehaviorSubject<string>('')
  private _identifier: string
  get identifier() { return this._identifier  }
  getIdentifierObs() { return this.identifierObs.asObservable() }
  set identifier(i: string) {
    this.identifierObs.next(i)
    this._identifier = i
  }

  private stringToTranslateObs = new BehaviorSubject<string>('')
  private _stringToTranslate: string = ''
  get stringToTranslate() { return this._stringToTranslate }
  getStringToTranslateObs() { return this.stringToTranslateObs.asObservable() }
  set stringToTranslate(s: string) {
    this.stringToTranslateObs.next(s)
    this._stringToTranslate = s
  }

  private translationObs = new BehaviorSubject<string>('')
  set translation(t: string) {this.translationObs.next(t)}
  getTranslationObs() {return this.translationObs.asObservable()}

  fileTxtBeforeSave: string
  
  constructor(
    private db: DataService,
    private readFile: ReadFileService,
    private dialog: DialogService,
    private project: ProjectService
  ) {

    this.activeElementObs.subscribe(e => this.onActiveElement(e))

    this.project.getFileTxtInitialObs().subscribe(t => {
      this.fileTxtBeforeSave = this.unescapeHTML(t.toString())})

  }

  // ACTIVE ELEMENT

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


  // IDENTIFIER

  async addIdentifierToElement() {
    if (this.activeElement) {

      let atrrtibute = this.activeElement.getAttribute('identifier')
      if (!atrrtibute) {
        let identifier = (await this.db
          .addElementIdentifier(this.stringToTranslate, this.project.name))
          .toString()
        
        if (identifier) {
          let modified:boolean = await this.addIdentifierToFileTxt(identifier)
          if (modified) {
            this.identifier = identifier
            this.activeElement.setAttribute('identifier', identifier)
          } else this.identifier = ''
        } else this.identifier = ''
      }
    }
  }


  private async addIdentifierToFileTxt(identifier: string): Promise<boolean> {
    let styles = this.activeElement.getAttribute('style')
    this.activeElement.removeAttribute('style')
    let elementAsTxt = this.unescapeHTML(await this.activeElement.outerHTML)
    this.activeElement.setAttribute('style', styles)

    if (this.fileTxtBeforeSave.includes(elementAsTxt)) {

      let newElementAsText = elementAsTxt.replace('>', ` identifier="${identifier}">`) 
      let newFileTxt = this.fileTxtBeforeSave.replace(elementAsTxt, newElementAsText)
      if (this.fileTxtBeforeSave !== newFileTxt) {
        this.fileTxtBeforeSave = newFileTxt
        this.dialog.setDialogOnlyHeader('Identifier added!')
        return true
      } else throw new Error('replacing error')
    } else throw new Error('didnt find this part')
  }
  

  private setIdentifierIfExist(element: HTMLElement): void {
    let identifier = element.getAttribute('identifier')
    if (identifier) this.identifier = identifier
    else this.identifier = ''
  }

  async removeIdentifier() { 
    if (this.activeElement) { 
      let identifier = this.activeElement.getAttribute('identifier')
      if (identifier) {
        let removed = await this.removeIdentifierFromFileTxt(identifier)
        if (removed) { 
          this.activeElement.removeAttribute('identifier')
          this.identifier = ''
          this.project.saveProject(this.fileTxtBeforeSave)
        }
      }
    }
  }

  
  private async removeIdentifierFromFileTxt(identifier: string): Promise<boolean> {
    let result = false
    let styles = this.activeElement.getAttribute('style')
    this.activeElement.removeAttribute('style')
    let elementAsTxt = this.unescapeHTML(await this.activeElement.outerHTML)
    this.activeElement.setAttribute('style', styles)
    let txtToRemove = ` identifier="${identifier}"`


    if (this.fileTxtBeforeSave.includes(txtToRemove)) {
      console.log(txtToRemove)



      let newFileTxt = this.fileTxtBeforeSave.replace(txtToRemove, '')
      if (this.fileTxtBeforeSave !== newFileTxt) { 
        this.fileTxtBeforeSave = newFileTxt
        this.db.removeIdentifier(this.project.name, identifier)
        result = true
      }
    }
    return result
  }

  unselect(): void {
    this.stringToTranslate = ''
    this.activeElement = null
    this.identifier = ''
  }









  // OTHERS


  private unescapeHTML(escapedHTML: string): string {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
  }


  async saveProject() {
    return await this.project.saveProject(this.fileTxtBeforeSave)
  }

}
