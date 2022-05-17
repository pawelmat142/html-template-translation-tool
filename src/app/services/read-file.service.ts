import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { DataService } from './data.service';
import { LanguagesService } from './languages.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// STORES, SETS, MODIFIY AND RETURNS HTML FILE - AS TEXT FOR EXAMPLE

@Injectable({
  providedIn: 'root'
})
export class ReadFileService {
  
  constructor(
    private language: LanguagesService,
    private db: DataService,
    private domSanitizer: DomSanitizer
  ) { }

  private _name: string

  private fileObs = new Subject<File>()
  private _file: File

  private textObs = new Subject<string>()
  private _text: string

  private texSanitized: SafeHtml

  set name(n: string) {
    this._name = n
  }

  get name() {
    return this._name
  }

  get nameNotFull(): string {
    return this._name?.split('.').shift()
  }


  set file(f: File) {
    console.log('set')
    console.log(f)
    this.fileObs.next(f)
    this._file = f
    this.setTextWhenSetFile(f)
    this.name = f ? f.name : ''
  }
  
  async setTextWhenSetFile(file: File) {
    this._text = file ? await file.text() : ''

    this.texSanitized = this.domSanitizer.bypassSecurityTrustHtml(this._text)
    let a = this.domSanitizer

    this.textObs.next(this.texSanitized as string)
    this.language.setOriginLanguage(this._text)
  }


  get file() { 
    return this._file
  }

  getFileObs() {return this.fileObs.asObservable()}


  set text(t: string) {
    this._text = t
  }

  get text(): string {
    return this._text
  }

  getTextObs(): Observable<string> {
    return this.textObs.asObservable()
  }

}
