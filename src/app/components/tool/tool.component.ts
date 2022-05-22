import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChildren, ElementRef, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
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

  @Input() identifier: string
  @Input() originTexts: string[]
  @Input() translateToTexts: string[]

  @Output() removeIdentifierEvent = new EventEmitter<void>()
  @Output() unselectEvent = new EventEmitter<void>()
  @Output() autoIdentifyEvent = new EventEmitter<void>()
  @Output() saveTemplateEvent = new EventEmitter<void>()
  @Output() translateTemplateEvent = new EventEmitter<void>()
  @Output() generateEvent = new EventEmitter<void>()

  @ViewChildren('translationAreaRef')
  translationAreaRefs: ElementRef[]

  @HostBinding('class') classes = ''
  
  fileName: string 
  projectName: string
  originLanguageObs: Observable<string>
  translateToLanguageObs: Observable<string>

  constructor(
    private language: LanguagesService,
    private template: TemplateService,
    private dialog: DialogService,
    private auth: AuthenticationService,
    private project: ProjectService,
    private router: Router,
  ) {
    this.fileName = this.project.file.name
    this.projectName = this.project.project.name

    this.originLanguageObs = this.language
      .getOriginObs().pipe(map((language: Language) => language.name))
    
    this.translateToLanguageObs = this.language
      .getTranslateToObs().pipe(map((language: Language) => language.name))
  }

  translations: string[]

  ngOnInit(): void {
    // this.template.unselect()
  }

  ngOnChanges(change: SimpleChanges): void {
    // triggered by onActiveElement() - template component
    if (!change.originTexts.firstChange) {
      let newOriginTexts = change['originTexts'].currentValue
      this.translations = newOriginTexts.map(el => '')
      if (this.translateToTexts && this.translateToTexts.length) { 
        this.translations = this.translateToTexts
      }
    }
  }

  // LEFT BAR
  
  removeIdentifier() { 
    this.removeIdentifierEvent.emit()
  }

  async onAddTranslation() {
    let translations: string[] = this.translationAreaRefs
      .map(t => t.nativeElement.innerText.replace(/\n/g, ''))
    // *********************************
    let origins = this.template.activeTranslationElement[this.language.origin]
    translations = this.fillSpacesIfNeeds(translations)
    console.log(origins)
    console.log(translations)
    try {
      let filled = translations.every(t => !!t)
      if (!filled) throw new Error('Fill in all translation fields')
      await this.template.setTranslation(translations)
      this.dialog.setDialogOnlyHeader('Succesfull')
      this.template.setAsTranslated(this.identifier)
      this.onUnselect()
    } catch (error) { 
      this.dialog.setDialogOnlyHeader(error.message)
    }
  }

  onUnselect(): void {this.unselectEvent.emit() }
  
  async removeTranslation() { 
    try { 
      await this.template.removeTranslation()
      this.dialog.setDialogOnlyHeader('Removed!')
      this.template.setAsNotTranslated(this.identifier)
      this.onUnselect()
    } catch (error) { 
      this.dialog.setDialogOnlyHeader(error.message)
    }
  }

  // BOTTOM BAR
  
  onChooseLanguage(): void {
    this.dialog.clearDialog()
    this.dialog.purpose = 'language'
    this.dialog.open()
  }
  
  autoIdentify(): void { this.autoIdentifyEvent.emit() }
  
  // HIDDEN ROW

  saveTemplate(): void { this.saveTemplateEvent.emit() }
  
  translateTemplate() { this.translateTemplateEvent.emit() }
  
  generateTemplate() { this.generateEvent.emit() }

  async onLeave() {
    await this.askIfSave()
    this.project.file = null
    this.router.navigate(['projects'])
  }
  
  onOriginDownload() { this.project.downloadOriginFile(this.project.name) }
  
  onLogout(): void { this.auth.logout() }


  // OTHERS

  askIfSave() {
    return new Promise(resolve => {
      this.dialog.setDialogWithConfirmButton(
        'Warning!',
        'Are you sure you want to leave before saving project?',
        resolve,
      )
    })
  }

  private fillSpacesIfNeeds(translations: string[]): string[] {
    let result = translations.map(el => el)
    let origins = this.template.activeTranslationElement[this.language.origin]
    origins.forEach((txt:string, index: number) => {
      if (txt.startsWith(' ')) { 
        result[index] = ` ${result[index]}`
      }
      if (txt.endsWith(' ')) { 
        result[index] = `${result[index]} `
      }
    })
    return result
  }

}
