import { Component, HostBinding, OnInit } from '@angular/core';
import { Dialog } from 'src/app/models/dialog';
import { Collection } from 'src/app/models/collection';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { Observable } from 'rxjs';
import { ReadFileService } from 'src/app/services/read-file.service';

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

  collectionsObs: Observable<Collection[]>
  collections: Collection[]

  fileName: string = ''

  private dialog: Dialog = {
    open: false,
    header: 'initial',
    txt: [],
  }

  constructor(
    private service: DialogService,
    private language: LanguagesService,
    private db: DataService,
    private readFile: ReadFileService,
  ) {
    this.languages = this.language.list

    this.readFile.getFileObs().subscribe(f => this.fileName = f.name)

    this.service.getObs().subscribe((dialog: any) => {
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

  onConfirm(): void {
    console.log(this.purpose)
  }


  setLanguage(language: string): void {
    this.language.toChange = language
    this.service.purpose = ''
  }


}
