import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { ReadFileService } from 'src/app/services/read-file.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  fileName: string = ''

  collectionObs: Observable<string>

  constructor(
    private auth: AuthenticationService,
    private readFile: ReadFileService,
    private db: DataService
  ) { 

    this.readFile.getFileObs().subscribe((f: File) => this.fileName = f ? f.name : '')
    this.collectionObs = this.db.getCollectionObs()
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.auth.logout()
  }

  
  onFileSelected(event: any) {
    const file = event.target.files[0] as File
    if (this.htmlFile(file)) {

      this.readFile.file = file

    } else { 
      this.fileName = ''
      throw new Error('file has to be HTML')
    }
  }

  onRemoveFile(): void {
    this.readFile.file = null
  }


  private htmlFile(file: File): boolean {
    if (file.name.split('.').pop() === 'html') {
      return true
    } else { 
      return false
    }
  }

}
