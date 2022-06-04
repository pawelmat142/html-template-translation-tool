import { Injectable } from '@angular/core';
import { TranslationElement } from '../models/translationElement';
import { BordersService } from './borders.service';
import { DataService } from './data.service';
import { DialogService } from './dialog.service';
import { IdentificatorService } from './identificator.service';
import { LanguagesService } from './languages.service';
import { ProjectService } from './project.service';
import { TranslatorService } from './translator.service';

// STORES AND MODIFY TRANSLATION ELEMENTS ARRAY

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  
  fileAsTxt: string

  constructor(
    private db: DataService,
    private dialog: DialogService,
    private project: ProjectService,
    private language: LanguagesService,
    private translator: TranslatorService,
    private identificator: IdentificatorService,
    private borders: BordersService
  ) {}
  
  _reference: HTMLElement
  get reference(): HTMLElement { return this._reference }
  set reference(element: HTMLElement) {
    this._reference = element
    this.identificator.templateReference = element
  }
    
  translationElements: TranslationElement[] = [] //filled when template is initialized
  activeTranslationElement: TranslationElement  

  async initTranslationElements(): Promise<void> {
    this.translationElements = []
    let notInTemplate: string[] = []
    const translationElements = await this.db
      .getProjectTranslationDocs(this.project.name)
    translationElements.forEach(el => {
      const node = document.querySelector(`[identifier="${el.identifier}"]`)
      if (node) this.translationElements.push(el)
      else notInTemplate.push(el.identifier)
    })
    if (notInTemplate.length > 0) { 
      this.db.deleteTranslationDocuments(this.project.name, notInTemplate)
    }
    // this.identificator.loadElements(this.translationElements)
  }
  
  setActiveTranslationElement(identifier: string): void { 
    this.activeTranslationElement = this.translationElements
      .find(el => el.identifier === identifier)
  }

  
  // ELEMENTS TRANSLATION
  
  async setTranslation(translations: string[], _identifier?: string): Promise<void> {
    let identifier = _identifier ? _identifier : this.activeTranslationElement.identifier
    if (this.activeTranslationElement) { 
      this.activeTranslationElement[this.language.translateTo] = translations
    }
    try {
      await this.db.updateTranslationDoc(
        this.project.name,
        identifier,
        this.language.translateTo,
        translations
      )
    } catch (error) {
      this.dialog.setDialogOnlyHeader('db: update doc error')
    }
  }

  async removeTranslation(): Promise<void> {
    this.activeTranslationElement[this.language.translateTo] = []
    try {
      await this.db.updateTranslationDoc(
        this.project.name,
        this.activeTranslationElement.identifier,
        this.language.translateTo,
        []
      )
    } catch (error) {
      this.dialog.setDialogOnlyHeader('db: update doc error')
    }
  }


  // FROM TOOL COMPONENT
  translateImages(): void {
    this.translator.set(this.translationElements)
    this.translator.imagesElements()
  }

  translateHead(): void {
    this.translator.set(this.translationElements)
    this.translator.headElements()
  }
  
  async translateTemplate(translated: boolean): Promise<boolean> {
    this.translator.setReference(this._reference)
    this.translator.set(this.translationElements)
    return await this.translator.translateTemplate(translated)
  }
  
  untranslated(): void {
    this.translator.set(this.translationElements)
    this.translator.untranslated()
  }

    
  // identificator
  identify(content: Node): void {
    let newElements = this.identificator
      .identify(content, this.translationElements)
    this.translationElements.push(...newElements)
    this.borders.init(this.translationElements)
  }
  setIdentifiersToRemove(identifiers: string[]): void {
    this.identificator.identifiersToRemove = identifiers
  }
  async removeElementIdentifier(element: HTMLElement): Promise<void>  {
    this.identificator.removeElementIdentifier(element, this.project.name)
  }

  removeIdentifiersToRemove(): void {
    this.identificator.removeIdentifiersToRemove(this.project.name)
  }
  async removeAll() { 
    this.identificator.removeAll(this.project.name)
  }

  // borders
  initBorders(): void {this.borders.init(this.translationElements)}
  setAsTranslated(identifier: string) {this.borders.setAsTranslated(identifier)}
  setAsNotTranslated(identifier: string) {this.borders.setAsNotTranslated(identifier)}


  // OTHERS

  async saveTemplate(file: File) {
    await this.project.saveTemplate(file, this.translationElements)
    this.dialog.setDialogOnlyHeader('Project saved successfully!')
  }
}


