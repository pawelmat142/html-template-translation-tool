import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { Observable, map, BehaviorSubject} from 'rxjs';
import { Collection } from '../../models/collection';
import { ReadFileService } from 'src/app/services/read-file.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  collections: Collection[]
  filenameAdding: string = ''
  fileForNewProject: File

  constructor(
    private auth: AuthenticationService,
    private service: ProjectService,
    private readFile: ReadFileService,
    private db: DataService,
    private dialog: DialogService,
    private router: Router
  ) { 

    this.db.getUserProjectsObs().subscribe(
      result => this.collections = result)

  }

  inputOpen: boolean = false
  input: string = ''

  ngOnInit(): void { }


  onFileSelected(event: any) {
    this.fileForNewProject = event.target.files[0] as File
    try {
      if (!this.htmlFile(this.fileForNewProject)) throw new Error('file has to be html')

      let isFilenameTaken = this.collections
        .find(el => el.filename === this.fileForNewProject.name)
      if (isFilenameTaken) throw new Error('file name is already taken')

      this.filenameAdding = this.fileForNewProject.name
      this.inputOpen = true

    } catch (error) { 
      this.fileForNewProject = null
      this.dialog.setDialogOnlyHeader(error.message)
    }
  }
  
  rejectAddingProject() {
    this.filenameAdding = ''
    this.fileForNewProject = null
    this.inputOpen = false
  }

  async onAddNewProject() {
    let isNameTaken = this.collections.find(el => el.name === this.input)
    if (isNameTaken) {
      this.dialog.setDialogOnlyHeader('Project name is already taken!')
    } else { 
      
      let newCollection: Collection = {
        name: this.input,
        filename: this.filenameAdding,
        modified: new Date().toLocaleDateString() +
          ' ' + new Date().toLocaleTimeString()
      }

      let result = await this.db
        .addProject(newCollection, this.fileForNewProject)
      
      if (result) { 
        console.log(result)
        this.inputOpen = false
      }
    }
  }

  onDelete(project: Collection): void {
    this.db.deleteProject(project.name, project.filename)
  }


  async onSetProject(project: Collection) {
    let file = await this.db.downloadFile(project.filename)
    // let txt = await file.text()
    // console.log(txt)
    this.service.file = file
    this.service.project = project
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
