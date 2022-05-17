import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { TemplateService } from 'src/app/services/template.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProjectService } from 'src/app/services/project.service';
import { Language } from 'src/app/models/language';


// USER INTERFACE / TOOLS TO LOAD AND MODIFY TEMPLATE

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.css']
})
export class ToolComponent implements OnInit {

  @Output() translatedEvent = new EventEmitter<boolean>();
  
  fileName: string 
  projectName: string
  originLanguageObs: Observable<string>
  toChangeLanguageObs: Observable<string>

  identifierObs: Observable<string>
  stringToTranslateObs: Observable<string>
  translationArea: string = ''

  constructor(
    private language: LanguagesService,
    private template: TemplateService,
    private dialog: DialogService,
    private auth: AuthenticationService,
    private db: DataService,
    private project: ProjectService,
    private router: Router,
  ) {

    this.fileName = this.project.file.name
    this.projectName = this.project.project.name

    this.originLanguageObs = this.language
      .getOriginObs().pipe(map((language: Language) => language.name))
    
    this.toChangeLanguageObs = this.language
      .getToChangeObs().pipe(map((language: Language) => language.name))
    
    this.identifierObs = this.template.getIdentifierObs()
    this.stringToTranslateObs = this.template.getStringToTranslateObs()

    this.template.getTranslationObs()
      .subscribe(translation => this.translationArea = translation)
  }

    
  ngOnInit(): void {
    this.template.unselect()
  }

  async getDocByIdentifier() { 
    let identifier = this.template.identifier
    let doc = await this.db.getDocByIdentifier(identifier, this.project.name)
  }


  // BOTTOM BAR

  onClearButton(): void {
    this.template.unselect()
  }
  
  onChooseLanguage(): void {
    this.dialog.clearDialog()
    this.dialog.purpose = 'language'
    this.dialog.open()
  }

  onLogout(): void {
    this.auth.logout()
  }
  
  async onLeave() {
    await this.askIfSave()
    this.template.unselect()
    this.project.file = null
    this.router.navigate(['projects'])
  }

  askIfSave() {
    return new Promise(resolve => {
      this.dialog.setDialogWithConfirmButton(
        'Warning!',
        'Project is not saved. Are you sure you want to leave?',
        resolve,
      )
    })
  }

  async onSave() {
    let saved = await this.template.saveProject()
    if (saved) this.dialog.setDialogOnlyHeader('Done!')
    else this.dialog.setDialogOnlyHeader('Saving error!')
  }
  

  // LEFT BAR

  addIndentifier(): void {
    this.template.addIdentifierToElement()
  }
  
  removeIdentifier() { 
    this.template.removeIdentifier()
  }

  async onTranslate() {
    let ontranslateresult = await this.db.addTranslation(
      this.template.identifier,
      this.language.toChange,
      this.translationArea,
      this.project.name
    )
    if (ontranslateresult) { 
      this.translatedEvent.emit(true)
      this.template.activeElement = null
      this.translationArea = ''
    }
  }


  // left bottom

  autoIdentify() { 
    console.log('autoIdentify')
  }
}
