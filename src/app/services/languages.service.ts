import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

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

  private current = new Subject<Language>()

  private origin = new Subject<Language | null>()

  constructor() { }

  get list(): String[] { 
    return this.langs.map(l => l.name)
  }

  get get(): Observable<Language> { 
    return this.current.asObservable()
  }

  
  set set(name: String) { 
    if (this.list.includes(name)) {
      const lang = this.langs.find(l => l.name === name) as Language
      this.current.next(lang)
    } else throw new Error('no such language')
  }


  getOrigin(): Observable<Language | null> { 
    return this.origin.asObservable()
  }

  getByName(name: String): Language { 
    return this.langs.find(l => l.name === name) as Language
  }


  getByCode(code: String): Language {
    return this.langs.find(l => l.code === code) as Language
  }

  setOriginLanguage(txt: String): void {
    let position = txt.search('lang="')
    if (position) { 
      let langCode = txt.substr(position + 6, 2)
      let result = this.getByCode(langCode)
      if (result) this.origin.next(result)
      else this.origin.next(null)
    } else throw new Error('lang code not found!')
  }

  lol(): void {
    console.log('lol')
  }


  



}