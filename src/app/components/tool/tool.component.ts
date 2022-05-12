import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
import { Language } from 'src/app/models/language';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { TemplateService } from 'src/app/services/template.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { ReadFileService } from 'src/app/services/read-file.service';
import { AuthenticationService } from 'src/app/services/authentication.service';


// USER INTERFACE / TOOLS TO LOAD AND MODIFY TEMPLATE

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.css']
})
export class ToolComponent implements OnInit {

  fileName: string = ''

  @Output() translatedEvent = new EventEmitter<boolean>();
  @Output() generateTemplateEvent = new EventEmitter<void>();
  @Output() lolEvent = new EventEmitter<void>();

  originLanguageObs: Observable<string>
  toChangeLanguageObs: Observable<string>
  identifierObs: Observable<string>
  stringToTranslateObs: Observable<string>
  collectionObs: Observable<string>
  translationArea: string = ''


  constructor(
    private language: LanguagesService,
    private template: TemplateService,
    private dialog: DialogService,
    private readFile: ReadFileService,
    private auth: AuthenticationService,
    private db: DataService
  ) {

    this.originLanguageObs = this.language
      .getOriginObs().pipe(map((language: Language) => language.name))
    
    this.toChangeLanguageObs = this.language
      .getToChangeObs().pipe(map((language: Language) => language.name))
    
    this.template.getActiveElementObs().subscribe(
      element => this.showHideRightTool(element))
    
    this.identifierObs = this.template.getIdentifierObs()

    this.stringToTranslateObs = this.template.getStringToTranslateObs()

    this.collectionObs = this.db.getCollectionObs()

  }

  @HostBinding('class') classes: string
  isOpen: boolean = false

  private showHideRightTool(element: HTMLElement): void {
    if (element) this.show()
    else this.hide()
    
    console.log(element)
  }
  
  private show(): void {
    if (!this.isOpen) { 
      this.isOpen = true
      this.classes = '_show'
    }
  }
  
  private hide(): void {
    if (this.isOpen) {
      this.classes += ' _hide'
      setTimeout(() => { 
        this.classes = ''
        this.isOpen = false
      },200)
    }
  }

    
  ngOnInit(): void { }


  // BOTTOM BAR

  onFileSelected(event: any) {
    const file = event.target.files[0] as File
    if (this.htmlFile(file)) {

      this.readFile.file = file

    } else { 
      this.fileName = ''
      throw new Error('file has to be HTML')
    }
  }

  onClearButton(): void {
    this.template.stringToTranslate = ''
    this.template.activeElement = null
    this.template.identifier = ''
  }
  
  onCollection(): void {
    this.dialog.clearDialog()
    this.dialog.purpose = 'collection'
    this.dialog.open()
  }
  
  onChooseLanguage(): void {
    this.dialog.clearDialog()
    this.dialog.purpose = 'language'
    // this.dialog.chooseLanguageSet()
    this.dialog.open()
  }


  onLogout(): void {
    this.auth.logout()
  }


  // RIGHT BAR

  async onTranslate() {
    let ontranslateresult = await this.db.addTranslation(
      this.template.identifier,
      this.language.toChange,
      this.translationArea
    )

    if (ontranslateresult) { 

      this.translatedEvent.emit(true)
      this.template.activeElement = null
      this.translationArea = ''
    }
  }


  addIndentifier(): void {
    this.template.addIdentifierToElement()
  }



  // OTHERS

  scrollTop(): void {
    console.log('scrolltop')
  }

  private htmlFile(file: File): boolean {
    if (file.name.split('.').pop() === 'html') {
      return true
    } else { 
      return false
    }
  }


  generateTemplate(): void {
    let name = this.readFile.nameNotFull
    if (name) {
      this.download(name + '_template.html', this.readFile.text)
    } else {
      this.dialog.clearDialog()
      this.dialog.header = 'Not any file loaded!'
      this.dialog.open()
    }
  }

  private download(filename:string, textInput:string) {
    var element = document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

}
