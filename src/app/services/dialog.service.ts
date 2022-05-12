import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Dialog, DialogButton } from '../models/dialog';
import { LanguagesService } from './languages.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {


  // DIALOG MODAL WINDOW MANIPULATION

  purpose: string = ''
  languages: string[]

  private dialog: Dialog = {
    open: false,
    header: 'elo',
    txt: ['siema'],
    elements: [],
    closeButtonInner: 'CLOSE',
  }
  private dialogObs = new BehaviorSubject<Dialog>(this.dialog)

  constructor(private language: LanguagesService) {
    this.languages = this.language.list
  }

  getObs(): Observable<Dialog> {
    return this.dialogObs.asObservable()
  }

  open() { 
    this.dialog.open = true
    this.go()
  }

  close() { 
    this.dialog.open = false
    this.go()
  }

  set header(h: String) { 
    this.dialog.header = h
  }

  set txt(t: string) {
    if (t === '') {
      this.dialog.txt = []
    } else { 
      this.dialog.txt.push(t)
    }
  }

  set closeButtonInner(t: string) {
    this.dialog.closeButtonInner = t
  }


  set element(elAsText: string) {
    if (elAsText === '') {
      this.dialog.elements = []
    } else { 
      this.dialog.elements.push(elAsText)
    }
  }

  
  private go() { 
    this.dialogObs.next(this.dialog)
  }


  clearDialog() { 
    this.dialog.header = ''
    this.dialog.txt = []
    this.dialog.closeButtonInner = 'CLOSE'
    this.dialog.elements = []
    this.purpose = ''
  }


  chooseLanguageSet(): void {
    this.purpose = 'language'
    this.dialog = {
      open: true,
      header: 'Choose Language:',
      txt: ['aaa', 'bbb', 'ccc'],
      elements: null,
      closeButtonInner: 'Close',
      // okButtons: this.langs.list as string[]
    }
  }

  
}

