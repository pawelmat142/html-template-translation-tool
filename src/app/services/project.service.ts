import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Collection } from '../models/collection'
import { DomSanitizer } from '@angular/platform-browser';
import { LanguagesService } from './languages.service';
import { TemplateService } from './template.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  collections: Collection[]

  project: Collection
  get name() { return this.project.name }

  private _file: File
  get file() { return this._file }
  set file(file: File) {
    this._file = file
    this.setFileTxt(file)
  }

  private fileTxtInitialObs = new Subject<string>()

  getFileTxtInitialObs(): Observable<string> {
    return this.fileTxtInitialObs.asObservable()
  }

  private _fileTxt: string
  get fileTxt(): string { return this._fileTxt }
  set fileTxt(fileTxt: string) { this._fileTxt = fileTxt }
  
  async setFileTxt(file: File) { 
    let txt = file ? await file.text() : ''
    let sanitized = this.domSanitizer
      .bypassSecurityTrustHtml(txt)
    this._fileTxt = sanitized as string
    this.fileTxtInitialObs.next(sanitized as string)
    this.language.setOriginLanguage(sanitized as string)
  }


  constructor(
    private db: DataService,
    private domSanitizer: DomSanitizer,
    private language: LanguagesService,
  ) {

  }

  async saveProject(fileTextToSave: string) {
    this.project.modified = new Date().toLocaleDateString()
      + ' ' + new Date().toLocaleTimeString()
    
    let file = new File(
      [fileTextToSave],
      this.project.filename,
      {type: "text/html"}
    )
    
    let result = await this.db.addProject(this.project, file)
    return result
  }




}
