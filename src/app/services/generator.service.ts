import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { LanguagesService } from './languages.service';
import { Collection } from '../models/collection';
import { DialogService } from './dialog.service';
import { FileService } from './file.service';
import { Language } from '../models/language';
import { TranslationElement } from '../models/translationElement';
import { TranslatorService } from './translator.service';

// SIMPLY GENERATES READY PROJECT TEMPLATE FROM PROJECTS LIST

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  private translateToFull: Language

  private translationElements: TranslationElement[]

  constructor(
    private language: LanguagesService,
    private db: DataService,
    private dialog: DialogService,
    private file: FileService,
    private translator: TranslatorService
  ) { }

  async generate(project: Collection): Promise<void> {
    try {
      this.translateToFull = this.language.translateToFull
      if (!this.translateToFull.name) throw new Error('No translate to language')

      const DOC = await this.getDOC(project)
      await this.initTranslationElements(project, DOC)
      
      await this.translateDoc(DOC)
      this.file.generateTemplate(DOC, this.translateToFull)
      this.file.clear()
      this.language.reset()
    } catch (error) {
      this.dialog.setDialogOnlyHeader(error.message)
    }
  }


  private async getDOC(project: Collection): Promise<HTMLElement> { 
    const file = await this.db.downloadFile(project.filename)
    await this.file.initFile(file)
    const DOC: HTMLElement = document.createElement('div')
    DOC.innerHTML = this.file.getTemplateConent()
    return DOC
  }

  private async initTranslationElements(project: Collection, DOC: HTMLElement): Promise<void> { 
    this.translationElements = []
    const translationElements = await this.db
      .getProjectTranslationDocs(project.name)
    translationElements.forEach(el => {
      const node = DOC.querySelector(`[identifier="${el.identifier}"]`)
      if (node) this.translationElements.push(el)
    })
  }

  private async translateDoc(DOC: HTMLElement): Promise<void> {
    this.translator.setReference(DOC)
    this.translator.set(this.translationElements)
    await this.translator.translateTemplate(false)
  }

}
