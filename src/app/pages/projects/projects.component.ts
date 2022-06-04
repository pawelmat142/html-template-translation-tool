import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ProjectService } from 'src/app/services/project.service';
import { DialogService } from 'src/app/services/dialog.service';
import { Collection } from '../../models/collection';
import { LanguagesService } from 'src/app/services/languages.service';
import { Observable } from 'rxjs'
import { GeneratorService } from 'src/app/services/generator.service';

// USER PROJECTS MANAGMENT

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {

  filenameAdding: string = ''
  cssFilenameAdding: string = ''
  languages: string[]

  userProjectsObs: Observable<Collection[]>

  constructor(
    private service: ProjectService,
    private db: DataService,
    private dialog: DialogService,
    private router: Router,
    private language: LanguagesService,
    private generator: GeneratorService
  ) { 
    this.languages = this.language.list
    this.userProjectsObs = this.db.getUserProjectsObs()
  }

  inputOpen: boolean = false
  input: string = ''
  @ViewChild('languageRef') languageRef: ElementRef

  generateButtonInner = 'generate'


  async onFileSelected(event: any) {
    let file = event.target.files[0] as File
    try { 
      if (this.service.filenameTaken(file)) throw new Error('file name is taken!')
      if (!this.htmlFile(file)) throw new Error('file has to be HTML!')
      this.filenameAdding = file.name
      this.inputOpen = true
      this.service.fileForNewProject = file
    } catch (error) {this.dialog.setDialogOnlyHeader(error.message)}
  }

  onAddCss(project: Collection) {
    const input: HTMLInputElement = document.createElement('input')
    input.type = 'file'
    input.onchange = () => this.addCssFile(project.name, input.files[0])
    input.click()
  }

  async onDelCss(project: Collection) {
    try { 
      await this.service.deleteCssFile(project.name)
      this.dialog.setDialogOnlyHeader('CSS file removed!')
    } catch (error) {this.dialog.setDialogOnlyHeader(error.message)}
  }

  async addCssFile(projectName, file: File) { 
    try {
      if (!this.cssFile(file)) throw new Error('file has to be CSS!')
      await this.service.addCssFile(projectName, file)
      this.dialog.setDialogOnlyHeader('CSS file added')
    } catch (error) {this.dialog.setDialogOnlyHeader(error.message)}
  }


  async onCssFileSelected(event: any) {
    let file = event.target.files[0] as File
    try { 
      if (!this.cssFile(file)) throw new Error('file has to be CSS!')
      this.cssFilenameAdding = file.name
      this.service.cssFileForNewProject = file
    } catch (error) {this.dialog.setDialogOnlyHeader(error.message)}
  }

  rejectAddingProject() {
    this.filenameAdding = ''
    this.service.fileForNewProject = null
    this.inputOpen = false
  }

  async onAddNewProject() {
    try {
      if (this.service.projectNameTaken(this.input))
        throw new Error('project name is taken!')
      let newCollection: Collection = {
        name: this.input,
        filename: this.filenameAdding,
        cssName: '',
        modified: new Date().toLocaleDateString() +
          ' ' + new Date().toLocaleTimeString(),
        originLanguage: this.languageRef.nativeElement.value
      }
      let result = await this.service.addProject(newCollection)
      if (!result) throw new Error('add project error')
      this.rejectAddingProject()
    } catch (error) {this.dialog.setDialogOnlyHeader(error.message)}
  }

  onDelete(project: Collection): void {
    this.service.deleteProject(project.name)
  }

  onGenerate(project: Collection): void {
    if (!this.language.translateTo) {
      this.dialog.clearDialog()
      this.dialog.purpose = 'language'
      this.dialog.open()
    } else {
      console.log('generate')
      this.generator.generate(project)
    }
  }

  async onSetProject(project: Collection) {
    this.service.setProject(project) // TRIGGERS TEMPLATE INITIALIZATION
    this.router.navigate(['main'])
  }
    
  logout(): void {
    this.service.logout()
  }
  
  async deleteAccount() {
    await this.dialog.confirmDialog('Are you sure?!', 'Account and all data will be deleted.')
    this.service.deleteAccount()
  }

  private htmlFile(file: File): boolean {
    if (file.name.split('.').pop() === 'html') {
      return true
    } else return false
  }

  private cssFile(file: File): boolean {
    if (file.name.split('.').pop() === 'css') {
      return true
    } else return false
  }

  private wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

}
