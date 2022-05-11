import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Dialog, DialogButton } from '../models/dialog';
import { LanguagesService } from './languages.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private dialogObs = new Subject<Dialog>()

  dialogPurpose: string = ''

  private dialog: Dialog = {
    open: false,
    header: 'elo',
    txt: ['siema'],
    closeButtonInner: 'CLOSE',
    okButtons: []
  }

  constructor(private langs: LanguagesService) { 
  }

  get(): Observable<Dialog> {
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
    this.dialog.txt.push(t)
  }

  set closeButtonInner(t: string) {
    this.dialog.closeButtonInner = t
  }

  set okButton(button: string) {
    this.dialog.okButtons.push(button)
  }
  
  private go() { 
    this.dialogObs.next(this.dialog)
  }

  clearDialog() { 
    this.dialog.header = ''
    this.dialog.txt = []
    this.dialog.closeButtonInner = 'CLOSE'
    this.dialog.okButtons = []
  }

  chooseLanguageSet(): void {
    this.dialogPurpose = 'set language'
    this.dialog = {
      open: true,
      header: 'Choose Language:',
      txt: ['aaa', 'bbb', 'ccc'],
      closeButtonInner: 'Close',
      okButtons: this.langs.list as string[]
    }
  }


}

