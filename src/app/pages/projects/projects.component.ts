import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { ProjectService } from 'src/app/services/project.service';
import { DialogService } from 'src/app/services/dialog.service';
import { Collection } from '../../models/collection';
import { LanguagesService } from 'src/app/services/languages.service';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {

  filenameAdding: string = ''
  fileForNewProject: File
  languages: string[]

  userProjectsObs: Observable<Collection[]>

  constructor(
    private auth: AuthenticationService,
    private service: ProjectService,
    private db: DataService,
    private dialog: DialogService,
    private router: Router,
    private language: LanguagesService,
  ) { 
    
    this.languages = this.language.list
    this.userProjectsObs = this.db.getUserProjectsObs()
  }

  inputOpen: boolean = false
  input: string = ''
  @ViewChild('languageRef') languageRef


  async onFileSelected(event: any) {
    let file = event.target.files[0] as File
    try { 
      if (this.service.filenameTaken(file)) throw new Error('file name is taken!')
      if (!this.htmlFile(file)) throw new Error('file has to be HTML!')
      if (!(await this.service.hasBodySlicers(file)))
        throw new Error('file has to contain 2x <!-- bodyslicer -->')
      this.filenameAdding = file.name
      this.inputOpen = true
      this.service.fileForNewProject = file
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

  async onSetProject(project: Collection) {
    let file = await this.db.downloadFile(project.filename)
    this.service.file = file
    this.service.project = project
    this.language.setOriginLanguage(project.originLanguage)
    this.router.navigate(['main'])
  }
    
  logout(): void {
    this.auth.logout()
  }

  private htmlFile(file: File): boolean {
    if (file.name.split('.').pop() === 'html') {
      return true
    } else { 
      return false
    }
  }

}
