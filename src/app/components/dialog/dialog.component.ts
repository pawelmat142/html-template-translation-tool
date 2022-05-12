import { Component, HostBinding, OnInit } from '@angular/core';
import { Dialog } from 'src/app/models/dialog';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';


// MODAL WINDOW

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  @HostBinding('class') classes = ''

  input: string = ''
  languages: string[]

  private dialog: Dialog = {
    open: false,
    header: 'elo',
    txt: ['siema'],
    elements: [],
    closeButtonInner: 'Zamknij',
  }

  onClick() { 
    console.log('onclick')
  }

  constructor(
    private service: DialogService,
    private language: LanguagesService
  ) {
    this.languages = this.language.list

    this.service.getObs().subscribe((dialog: Dialog) => {
      if (dialog.open) {
        this.dialog = dialog;
        this.open()
      } else {
        this.close()
        setTimeout(() => this.dialog = dialog, 200)
      }
    })
  }

  get d(): Dialog { return this.dialog }

  get purpose(): string { return this.service.purpose}

  set header(h: string) {
    this.dialog.header = h
  }

  set text(s: string) {
    if (s === '') {
      this.dialog.txt = []
    } else { 
      this.dialog.txt.push(s)
    }
  }

  set closeButton(s: string) {
    this.dialog.closeButtonInner = s
  }

  ngOnInit(): void {}

  close(): void { 
    if (this.classes === 'open') {
      this.classes += ' close'
      setTimeout(() => this.classes = '', 200)
    }
  }

  open(): void {
    if (this.classes === '') { 
      this.classes = 'open'
    }
  }


  setCollection(): void {
    console.log('setCollection')
    console.log(this.input)
  }
  
  
  setLanguage(language: string): void {
    this.language.toChange = language
    this.service.purpose = ''
  }


}
