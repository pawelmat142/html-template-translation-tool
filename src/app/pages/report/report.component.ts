import { Component, HostBinding, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationElement } from 'src/app/models/translationElement';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { ProjectService } from 'src/app/services/project.service';
import { ReportService } from 'src/app/services/report.service';
import { TemplateService } from 'src/app/services/template.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {

  purpose: string
  elements: TranslationElement[]
  originLanguage: string
  translateTo: string

  translations: TranslationElement[]
  identifiersToRemove: string[] = []

  constructor(
    private project: ProjectService,
    private language: LanguagesService,
    private template: TemplateService,
    private service: ReportService,
    private router: Router,
    private dialog: DialogService,
    private db: DataService
  ) {
    this.purpose = this.service.purpose
    
    this.originLanguage = this.language.origin
    this.translateTo = this.language.translateTo
    this.originLanguage = 'polish'
    this.translateTo = 'english'
    
    this.elements = this.service.elements.map(el => {
      el[this.translateTo] = el[this.originLanguage].map(e => '')
      return el
    })
  }


  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.service.purpose = ''
    this.service.elements = []
  }

  removeIdentifier(identifier: string): void {
    this.identifiersToRemove.push(identifier)
    this.elements = this.elements.filter(el => el.identifier !== identifier)
  }

  async addTranslation(element: TranslationElement): Promise<void> {
    let identifier = element.identifier
    let translations = element[this.translateTo]
    console.log(translations)
    try {
      await this.db.updateTranslationDoc(
        this.project.name,
        identifier,
        this.translateTo,
        translations
      )
      this.elements = this.elements.filter(el => el.identifier !== identifier)
      this.dialog.setDialogOnlyHeader('Succesfull!')
    } catch (error) {
      this.dialog.setDialogOnlyHeader('db: update doc error')
    }
  }

  isDisabled(translations: string[]): boolean {
    return !translations.every(t => t !== '')
  }


  goBack(): void {
    if (this.identifiersToRemove && this.identifiersToRemove.length) { 
      this.template.setIdentifiersToRemove(this.identifiersToRemove)
    }
    this.router.navigate(['main'])
  }

}
