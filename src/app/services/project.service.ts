import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Subject } from 'rxjs';
import { Collection } from '../models/collection'
import { LanguagesService } from './languages.service';
import { TranslationElement } from '../models/translationElement';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  userProjects: Collection[]
  project: Collection
  get name() { return this.project.name }
  get filename() { return this.project.filename }

  saved: boolean = false

  private _file: File
  get file() { return this._file }
  set file(file: File) {
    this._file = file
    this.initTemplateObs(file)
  }

  private templateObs = new Subject<any>()
  getTemplateObs() { return this.templateObs.asObservable() }

  async initTemplateObs(_file?: File): Promise<void> { 
    let file = _file ? _file : this.file
    this.fileAsTxt = file ? await file.text() : ''
    this.templateObs.next(this.fileAsTxt)
    this.sliceFile(this.fileAsTxt)
  }

  openReportObs = new Subject<void>()

  private fileAsTxt: string
  private beforeBodyTxt: string
  private afterBodyTxt: string
  fileForNewProject: File

  constructor(
    private db: DataService,
    private dialog: DialogService,
    private language: LanguagesService,
  ) {
    this.db.getUserProjectsObs().subscribe(result => this.userProjects = result)
  }

  
  // PROJECTS MANAGMENT

  async addProject(newProject: Collection): Promise<boolean> {
    await this.db.uploadFile(this.fileForNewProject)
    let originFilename = this.fileForNewProject.name.split('.')[0] + '_origin.html'
    console.log(name)
    let fileOrigin = new File(
      [this.fileForNewProject],
      originFilename,
      { type: this.fileForNewProject.type }
    )
    await this.db.uploadFile(fileOrigin)
    await this.db.addProject(newProject)
    return true
  }

  async deleteProject(projectName: string) { 
    await this.askIfSure()
    let filename = this.userProjects.find(project => project.name === projectName).filename
    await this.db.deleteFile(filename)
    let originFilename = filename.split('.')[0] + '_origin.html' 
    await this.db.deleteFile(originFilename)
    // await this.db.deleteTranslationDocs(projectName)
    await this.db.removeUserProject(projectName)
  }
  
  async saveTemplate(contentBodyAfterIdentify: string, translationElements: TranslationElement[]) {
    this.project.modified = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString()
    let file = new File(
      [this.getFileText(contentBodyAfterIdentify)],
      this.project.filename,
      {type: "text/html"}
    )
    try { 
      await this.db.updateProject(this.project)
      await this.db.uploadFile(file)
      await this.db.addTranslationDocs(this.project.name, this.language.origin, translationElements)
    } catch (error) { console.log(error) }
  }

  async downloadOriginFile(projectName: string) {
    try { 
      let filename = this.userProjects
        .find(project => project.name === projectName)
        .filename.split('.')[0] + '_origin.html'
      let file: File = await this.db.downloadFile(filename)
      this.downloadFile(file)
    } catch (error) { console.log(error) }
  }

  async generateTemplate(newConent: string) { 
    try {
      let filename = this.project.filename.split('.')[0] + '_'
        + this.language.translateToFull.code + '.html'
      let file = new File(
        [this.getFileText(newConent)],
        filename,
        {type: "text/html"}
      )
      this.downloadFile(file)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }


  // OTHERS

  private downloadFile = (file: File) => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = file.name
    document.body.append(link)
    link.click()
    link.remove()
  }

  private sliceFile(fileAsTxt: string): void { 
    let parts = fileAsTxt.split('<!-- bodyslicer -->')
    this.beforeBodyTxt = parts[0]
    this.afterBodyTxt = parts[2]
  }

  private getFileText(contentBodyAfterIdentify: string) {
    let newFileTxt = 
      this.beforeBodyTxt +
      '\n' +
      '<!-- bodyslicer -->' + 
      '\n' +
      contentBodyAfterIdentify + 
      '\n' +
      '<!-- bodyslicer -->' + 
      '\n' +
      this.afterBodyTxt
    return newFileTxt
  }

  filenameTaken(file: File): boolean { 
    let isFilenameTaken = this.userProjects
      .find(el => el.filename === file.name)
    return !!isFilenameTaken
  }

  projectNameTaken(name: string): boolean {
    return !!this.userProjects.find(el => el.name === name)
  }

  async hasBodySlicers(file: File): Promise<boolean> {
    let fileAsText = await file.text()
    let count = fileAsText.split('<!-- bodyslicer -->').length
    if (count === 3) return true
    else return false
  }

  askIfSure() {
    return new Promise(resolve => {
      this.dialog.setDialogWithConfirmButton(
        'Warning!',
        'Are you sure you want to delete this project?',
        resolve,
      )
    })
  }

}
