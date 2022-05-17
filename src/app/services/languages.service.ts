import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {


  // STORES DATA ABOUT CURRENT TEMPLATE LANGUAGE OR WHICH LANGUAGE TRANSLATE TO

  private langs: Language[] = [
    {
      name: 'english',
      origin: 'English',
      code: 'en'
    },
    {
      name: 'polish',
      origin: 'Polski',
      code: 'pl'
    },
  
    {
      name: 'german',
      origin: 'Deutsch',
      code: 'de'
    },
  
    {
      name: 'french',
      origin: 'Français',
      code: 'fr'
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

  private toChangeObs = new BehaviorSubject<Language>(this.initial)
  private _toChange: Language


  constructor() {
    this.originObs.subscribe(l => this._origin = l)
    this.toChangeObs.subscribe(l => this._toChange = l)
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


  setOriginLanguage(_txt: string): void {
    let txt = _txt.toString()
    let position = txt.search('lang="')
    if (position) { 
      let langCode = txt.substr(position + 6, 2)
      let result = this.getByCode(langCode)
      if (result) this.originObs.next(result)
      else this.originObs.next(this.initial)
    } else throw new Error('lang code not found!')
  }



  get toChange(): string { 
    return this._toChange.name
  }

  get toChangeFull(): Language { 
    return this._toChange
  }

  getToChangeObs(): Observable<Language> {
    return this.toChangeObs.asObservable()
  }

  getByName(name: String): Language { 
    return this.langs.find(l => l.name === name) as Language
  }


  getByCode(code: String): Language {
    return this.langs.find(l => l.code === code) as Language
  }

  set toChange(name: string) { 
    if (this.list.includes(name)) {
      const lang = this.langs.find(l => l.name === name) as Language
      this._toChange = lang
      this.toChangeObs.next(lang)
    } else throw new Error('no such language')
  }

}