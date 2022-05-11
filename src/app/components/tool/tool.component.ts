import { Component, HostListener, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { Language } from 'src/app/models/language';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { TemplateService } from 'src/app/services/template.service';

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.css']
})
export class ToolComponent implements OnInit {

  @Output() translatedEvent = new EventEmitter<boolean>();
  @Output() generateTemplateEvent = new EventEmitter<void>();

  originLanguage: string = ''
  language: string = ''
  identifier: string = ''

  stringToTranslate: string = ''

  translationArea: string = ''

  constructor(
    private lang: LanguagesService,
    private template: TemplateService,
    private dialog: DialogService,
    private db: DataService
  ) {

    this.subscribeLanguage()
    this.subscribeOriginLanguage()
    this.subscribeStringToTranslate()
    this.subscribeIdentifier()
  }

    
  ngOnInit(): void {
  }


  onChooseLanguage(): void {
    this.dialog.chooseLanguageSet()
    this.dialog.open()
  }

  async onTranslate() {
    let ontranslateresult = await this.db.addTranslation(
      this.identifier,
      this.language,
      this.translationArea
    )

    if (ontranslateresult) { 
      this.translatedEvent.emit(true)
      this.template.clearElement()
      this.translationArea = ''
    }
  }


  clearStringToTranslate(): void {
    this.template.clearStringToTranslate()
  }


  addIndentifier(): void {
    this.template.addIdentifierToElement()
  }


  scrollTop(): void {
    console.log('scrolltop')
  }


  generateTemplate(): void {
    this.generateTemplateEvent.emit()
  }



  private subscribeLanguage(): void {
    this.lang.get.subscribe(
      (l: Language) => this.language = l.name,
      (error) => console.log(error)
    )
  }

  private subscribeOriginLanguage(): void {
    this.lang.getOrigin().subscribe(
      (l: Language | null) => {
        this.originLanguage = l ? l.name : ''
      },
      (error) => console.log(error)
    )
  }

  private subscribeStringToTranslate(): void {
    this.template.getStringToTranslate().subscribe(
      (data) => this.stringToTranslate = data as string,
      (error) => console.log(error)
    )
  }


  private subscribeIdentifier(): void {
    this.template.getIdentifier().subscribe(
      (data) => this.identifier = data as string,
      (error) => console.log(error)
    )
  }

}
