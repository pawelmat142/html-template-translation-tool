import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { Observable, BehaviorSubject } from 'rxjs';
import { throws } from 'assert';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  // STORES DATA ABOUT CURRENT TEMPLATE LANGUAGE AND WHICH LANGUAGE TRANSLATE TO
  
  private langs: Language[] = [
    {
      name: 'german',
      origin: 'Deutsch',
      code: 'de'
    },
    {
      name: 'english',
      origin: 'English',
      code: 'en'
    },
    {
      name: 'spanish',
      origin: 'español',
      code: 'es'
    },
    {
      name: 'nederlands',
      origin: 'nederlands',
      code: 'nl'
    },
    {
      name: 'polish',
      origin: 'Polski',
      code: 'pl'
    },
    {
      name: 'russian',
      origin: 'pусский',
      code: 'ru'
    }
  ]

  private initial: Language = {
    name: '',
    origin: '',
    code: 'nn'
  }

  private originObs = new BehaviorSubject<Language>(this.initial)
  private _origin: Language

  private translateToObs = new BehaviorSubject<Language>(this.initial)
  private _translateTo: Language

  constructor() {
    this.originObs.subscribe(l => this._origin = l)
    this.translateToObs.subscribe(l => this._translateTo = l)
  }

  get list(): string[] { 
    return this.langs.map(l => l.name)
  }

  get origin(): string { 
    return this._origin.name
  }

  get originFull(): Language { 
    return this._origin
  }

  getOriginObs(): Observable<Language> { 
    return this.originObs.asObservable()
  }

  // auto set language
  // setOriginLanguageAuto(_txt: string): void {
  //   let txt = _txt.toString()
  //   let position = txt.search('lang="')
  //   if (position) { 
  //     let langCode = txt.substr(position + 6, 2)
  //     let result = this.getByCode(langCode)
  //     if (result) this.originObs.next(result)
  //     else this.originObs.next(this.initial)
  //   } else throw new Error('lang code not found!')
  // }

  setOriginLanguage(lang: string): void {
    let language = this.langs.find(l => l.name === lang)
    if (language) this.originObs.next(language)
    else throw new Error('lang code not found!')
  }


  get translateTo(): string { 
    return this._translateTo.name
  }

  get translateToFull(): Language { 
    return this._translateTo
  }

  getTranslateToObs(): Observable<Language> {
    return this.translateToObs.asObservable()
  }

  getByName(name: String): Language { 
    return this.langs.find(l => l.name === name) as Language
  }

  getByCode(code: String): Language {
    return this.langs.find(l => l.code === code) as Language
  }

  set translateTo(name: string) { 
    if (this.list.includes(name)) {
      // if (name === this.origin) this.dialog.setDialogOnlyHeader('Select a language other than origin')
      // else { 
        const lang = this.langs.find(l => l.name === name) as Language
        this._translateTo = lang
        this.translateToObs.next(lang)
      // }
    } else throw new Error('no such language')
  }

}