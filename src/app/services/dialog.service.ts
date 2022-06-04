import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Dialog } from '../models/dialog';
import { LanguagesService } from './languages.service';

// DIALOG MODAL WINDOW MANIPULATION

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  purpose: string = ''
  languages: string[]

  private dialog: Dialog = {
    open: false,
    header: 'initial',
    txt: [],
  }

  get active(): boolean {
    return this.dialog.open
  }

  set active(a: boolean) {
    this.dialog.open = a
  }

  private dialogObs = new BehaviorSubject<any>(this.dialog)

  constructor(private language: LanguagesService) {
    this.languages = this.language.list
  }

  getObs(): Observable<Dialog> {
    return this.dialogObs.asObservable()
  }

  open() {
    this.dialog.open = true
    this.dialogObs.next(this.dialog)
  }
  
  close() { 
    this.dialog.open = false
    this.dialogObs.next(null)
  }

  set header(h: string) { 
    this.dialog.header = h
  }

  set txt(t: string) {
    if (t === '') {
      this.dialog.txt = []
    } else { 
      this.dialog.txt.push(t)
    }
  }

  clearDialog() { 
    this.purpose = ''
    this.dialog.header = ''
    this.dialog.txt = []
    this.dialog.confirmFunction = null
  }

  private promise: Promise<void>

  confirmDialog(header: string, text?: string) {
    this.promise = new Promise((resolve) => {
      this.setDialogWithConfirmButton(
        header,
        text ? text : '',
        resolve
      )
    })
    return this.promise
  }

  private setDialogWithConfirmButton(
    header: string,
    text: string,
    confirmFunction: Function,
  ) { 
    this.clearDialog()
    this.dialog.header = header
    if (text) this.dialog.txt.push(text)
    this.dialog.confirmFunction = confirmFunction
    this.open()
  }


  setDialogOnlyHeader(header: string) {
    this.clearDialog()
    this.dialog.header = header
    this.open()
  }
}

