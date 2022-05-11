import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, catchError} from 'rxjs';
import { Language } from '../models/language';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { LanguagesService } from './languages.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private fileTxt = new Subject<String>();

  fileName: string = ''
  private fileNameObs = new Subject<string>();

  private activeElement: HTMLElement | null = null
  private activeElementObs = new Subject<HTMLElement | null>()

  private stringToTranslate: string = ''
  private stringToTranslateObs = new Subject<string>()

  private identifierObs = new Subject<String>()

  private originLanguage: string = ''

  constructor(
    private lang: LanguagesService,
    private db: DataService,
    private diaglog: DialogService
  ) {
    this.subscribeElement()
    this.subscribeFileName()
    this.subscribeOriginLanguage()
    this.subscribeStringToTranslate()
  }


  // fileTxt

  async setFile(file: File | null) {
    if (file) {
      this.fileNameObs.next(file.name)
      const txt = await file.text()
      this.lang.setOriginLanguage(txt)
      this.fileTxt.next(txt)
    } else { 
      this.fileNameObs.next('')
      this.fileTxt.next('')
      this.lang.setOriginLanguage('')
    }
  }

  getTxt(): Observable<String> {
    return this.fileTxt.asObservable();
  }

  clear() { 
    this.setFile(null)
  }


  // fileName

  getFileName(): Observable<string> {
    return this.fileNameObs.asObservable()
  }



  // Element

  setElement(element: HTMLElement) {
    this.activeElementObs.next(element)
  }

  getElement(): Observable<HTMLElement|null> { 
    return this.activeElementObs.asObservable()
  }

  clearElement() {
    this.activeElementObs.next(null)
    this.identifierObs.next('')
  }



  getStringToTranslate(): Observable<String> { 
    return this.stringToTranslateObs.asObservable()
  }

  clearStringToTranslate(): void { 
    this.stringToTranslateObs.next('')
    this.identifierObs.next('')
  }


  async addIdentifierToElement() {
    if (this.activeElement) {
      let atrrtibute = this.activeElement.getAttribute('identifier')
      if (atrrtibute) {
        this.identifierObs.next(atrrtibute)
      } else {
        console.log(this.activeElement)

        let identifier = (await this.db
          .addElementIdentifier(this.originLanguage, this.stringToTranslate))
          .toString()
        
        if (identifier) {
          this.activeElement.setAttribute('identifier', identifier)
          this.identifierObs.next(identifier)
        } else this.identifierObs.next('')
      }
    }
  }


  getIdentifier(): Observable<String> {
    return this.identifierObs.asObservable()
  }


  async generateTemplate(template: string) {
    if (this.fileName) {
      this.download(this.fileName + '_template.html', template)
    } else {
      this.diaglog.clearDialog()
      this.diaglog.header = 'Not any file loaded'
      this.diaglog.open()
    }
  }

    
  private subscribeElement(): void {
    this.getElement().subscribe(
      (element: HTMLElement | null) => {
        if (element) {
          this.activeElement = element as HTMLElement
          this.solveIdentifier(element)
          let txt = this.unescapeHTML(element.innerHTML)
          txt = this.unescapeHTML(txt)
          this.stringToTranslateObs.next(txt)
        } else this.stringToTranslateObs.next('')
      },
      (error) => console.log(error)
    )
  }


  private subscribeFileName(): void {
    this.fileNameObs.subscribe(
      data => { 
        this.fileName = data.split('.').shift() as string
        this.db.setCollectionName(this.fileName)
      },
      error => console.log(error)
    )
  }


  private subscribeOriginLanguage(): void {
    this.lang.getOrigin().subscribe(
      (data) => this.originLanguage = data ? data.name : '',
      error => console.log(error)
    )
  }

  private subscribeStringToTranslate(): void {
    this.stringToTranslateObs.subscribe(
      (data) => this.stringToTranslate = data,
      error => console.log(error)
    )
  }


    
  private unescapeHTML(escapedHTML: string): string {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
  }


  private solveIdentifier(element: HTMLElement): void {
    let identifier = element.getAttribute('identifier')
    if (identifier) {
      this.identifierObs.next(identifier)
    }
  }


  private download(filename:string, textInput:string) {
    var element = document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
}
