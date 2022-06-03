import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Subject } from 'rxjs';
import { Collection } from '../models/collection'
import { LanguagesService } from './languages.service';
import { TranslationElement } from '../models/translationElement';
import { DialogService } from './dialog.service';
import { FileService } from './file.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  userProjects: Collection[]

  project: Collection
  get name() { return this.project.name }
  get filename() { return this.project.filename }

  saved: boolean = false
  openReportObs = new Subject<void>()

  fileForNewProject: File
  cssFileForNewProject: File

  constructor(
    private db: DataService,
    private dialog: DialogService,
    private language: LanguagesService,
    private fileService: FileService,
    private auth: AuthenticationService,
  ) {
    this.db.getUserProjectsObs()
      .subscribe(result => this.userProjects = result)
  }

  async setProject(project: Collection) { 
    this.project = project
    this.language.setOriginLanguage(project.originLanguage)
    if (project.cssName) {
      const cssFile = await this.db.downloadFile(project.cssName)
      await this.fileService.setCss(cssFile)
    }
    let file: File = await this.db.downloadFile(project.filename)
    this.fileService.initFile(file)
  }

  clear(): void {
    this.project = null
    this.fileForNewProject = null
    this.cssFileForNewProject = null
    this.fileService.clear()
  }


  // PROJECTS MANAGMENT

  async addProject(newProject: Collection): Promise<boolean> {
    await this.db.uploadFile(this.fileForNewProject)
    if (this.cssFileForNewProject) {
      const cssFile = this.renameCssFile()
      newProject.cssName = cssFile.name
      await this.db.uploadFile(cssFile)
    }
    await this.db.uploadFile(this.renameOrigin())
    await this.db.addProject(newProject)
    this.fileForNewProject = null
    this.cssFileForNewProject = null
    return true
  }

  async deleteProject(projectName: string, notAsk?: boolean) {
    if (!notAsk) { 
      await this.dialog.confirmDialog('Warning!', 'Are you sure you want to delete this project?')
    }
    const project = this.userProjects.find(project => project.name === projectName)
    await this.db.deleteFile(project.filename)
    if (project.cssName) await this.db.deleteFile(project.cssName)
    let originFilename = project.filename.split('.')[0] + '_origin.html' 
    await this.db.deleteFile(originFilename)
    // await this.db.deleteTranslationDocs(projectName)
    await this.db.removeUserProject(projectName)
  }
  
  async saveTemplate(file: File, translationElements: TranslationElement[]) {
    this.project.modified = this.currentTime()
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
      this.fileService.download(file)
    } catch (error) { console.log(error) }
  }

  async addCssFile(projectName: string, file: File) { 
    let project = this.userProjects.find(p => p.name === projectName)
    
    const cssFile = this.renameCssFile(project.filename, file)
    await this.db.uploadFile(cssFile)
    
    project.modified = this.currentTime()
    project.cssName = cssFile.name
    await this.db.updateProject(project)
  }

  async deleteCssFile(projectName: string) { 
    let project = this.userProjects.find(p => p.name === projectName)
    project.modified = this.currentTime()
    await this.db.deleteFile(project.cssName)
    project.cssName = ''
    await this.db.updateProject(project)
  }


  // ACCOUNT
  async deleteAccount() {
    console.log(this.userProjects)
    await Promise.all(this.userProjects.map(async p => await this.deleteProject(p.name, true)))
    await this.auth.deleteAccount()
  }

  logout(): void { 
    this.auth.logout()
  }


  // OTHERS

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

  private renameOrigin(): File {
    return new File(
      [this.fileForNewProject],
      this.fileForNewProject.name.split('.')[0]+'_origin.html',
      { type: 'text/html' }
    )
  }

  private renameCssFile(_filename?: string, _cssFile?: File): File {
    const filename = _filename ? _filename : this.fileForNewProject.name
    const cssFile = _cssFile ? _cssFile : this.cssFileForNewProject
    return new File(
      [cssFile],
      filename.split('.')[0]+'.css',
      { type: 'text/css' }
    )
  }

  private currentTime(): string { 
    return new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
  }

}
