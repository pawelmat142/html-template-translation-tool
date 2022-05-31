import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Subject } from 'rxjs';
import { Collection } from '../models/collection'
import { LanguagesService } from './languages.service';
import { TranslationElement } from '../models/translationElement';
import { DialogService } from './dialog.service';
import { FileService } from './file.service';

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

  constructor(
    private db: DataService,
    private dialog: DialogService,
    private language: LanguagesService,
    private fileService: FileService
  ) {
    this.db.getUserProjectsObs()
      .subscribe(result => this.userProjects = result)
  }

  async setProject(project: Collection) { 
    this.project = project
    this.language.setOriginLanguage(project.originLanguage)
    let file: File = await this.db.downloadFile(project.filename)
    this.fileService.initFile(file)
  }


  clear(): void {
    this.project = null
    this.fileForNewProject = null
    this.fileService.clear()
  }

  unescapeHTML(escapedHTML: string): string {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
  }


  // PROJECTS MANAGMENT

  async addProject(newProject: Collection): Promise<boolean> {
    await this.db.uploadFile(this.fileForNewProject)
    let originFilename = this.fileForNewProject.name.split('.')[0] + '_origin.html'
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
    await this.dialog.confirmDialog('Warning!', 'Are you sure you want to delete this project?')
    let filename = this.userProjects.find(project => project.name === projectName).filename
    await this.db.deleteFile(filename)
    let originFilename = filename.split('.')[0] + '_origin.html' 
    await this.db.deleteFile(originFilename)
    // await this.db.deleteTranslationDocs(projectName)
    await this.db.removeUserProject(projectName)
  }
  
  async saveTemplate(file: File, translationElements: TranslationElement[]) {
    this.project.modified = new Date().toLocaleDateString()
      + ' ' + new Date().toLocaleTimeString()
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

}
