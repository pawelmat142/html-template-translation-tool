import { Component, HostBinding, OnInit } from '@angular/core';
import { Dialog } from 'src/app/models/dialog';
import { Language } from 'src/app/models/language';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  @HostBinding('class') classes = ''

  private dialog: Dialog = {
    open: false,
    header: 'elo',
    txt: ['siema'],
    closeButtonInner: 'Zamknij',
    okButtons: []
  }

  constructor(private dialogService: DialogService, private langs: LanguagesService) {
    this.dialogSubscribe()
  }

  get d(): Dialog { return this.dialog  }

  ngOnInit(): void {
  }

  onOkButton(index: number): void {
    if (this.dialogService.dialogPurpose === 'set language') {
      this.setLanguage(index)
    }
  }


  close(): void { 
    if (this.classes === 'open') {
      this.classes += ' close'
      setTimeout(() => this.classes = '', 200)
    }
  }

  
  private open(): void {
    if (this.classes === '') { 
      this.classes = 'open'
    }
  }


  private dialogSubscribe(): void {
    this.dialogService.get().subscribe(
      (dialog: Dialog) => {
        if (dialog.open) {
          this.dialog = dialog;
          this.open()
        }
        else { 
          this.close()
          setTimeout(() => this.dialog = dialog, 200)
        }
      }, error => console.log(error)
    )
  }


  private setLanguage(index: number): void {
    let language: String = this.langs.list[index]
    this.langs.set = language
    this.dialogService.dialogPurpose = ''
  }

}
