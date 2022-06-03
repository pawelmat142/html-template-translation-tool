import { Component, HostBinding, HostListener, OnDestroy } from '@angular/core';
import { Dialog } from 'src/app/models/dialog';
import { Collection } from 'src/app/models/collection';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { Observable } from 'rxjs';

// MODAL WINDOW

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnDestroy {

  @HostBinding('class') classes = ''

  languages: string[]

  private dialog: Dialog = {
    open: false,
    header: 'initial',
    txt: [],
  }

  constructor(
    private service: DialogService,
    private language: LanguagesService,
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

  set header(h: string) { this.dialog.header = h }

  set text(s: string) {
    if (s === '') {
      this.dialog.txt = []
    } else { 
      this.dialog.txt.push(s)
    }
  }

  close(): void { 
    if (this.classes === 'open') {
      this.classes += ' close'
      this.service.active = false
      setTimeout(() => this.classes = '', 200)
    }
  }
  
  open(): void {
    if (this.classes === '') { 
      this.classes = 'open'
    }
  }

  setLanguage(language: string): void {
    this.language.translateTo = language
    this.service.purpose = ''
  }

  ngOnDestroy(): void {
    this.service.active = false
    console.log('destroy')
  }

  // KEYBOARD

  @HostListener('window:keyup', ['$event.key'])
  keyEvent(key: string) {
    if (key === 'Escape' || key === 'Enter') { 
      if (this.service.active) this.close()
    }
  }
}
