import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TemplateService } from 'src/app/services/template.service';
// import * as cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  fileName: string = ''

  constructor(
    private auth: AuthenticationService,
    private template: TemplateService
  ) { 

    this.fileNameSubscribe()
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.auth.logout()
  }

  onFileSelected(event: any) {
    // const file = cloneDeep(event.target.files[0])
    const file = event.target.files[0] as File
    if (this.htmlFile(file)) {
      // this.template.setFileName(file.name)
      this.template.setFile(file)
    } else { 
      this.fileName = ''
      this.template.clear()
      throw new Error('file has to be HTML')
    }
  }

  private htmlFile(file: File): boolean {
    if (file.name.split('.').pop() === 'html') {
      return true
    } else { 
      return false
    }
  }


  private fileNameSubscribe() { 
    this.template.getFileName().subscribe(
      (data) => this.fileName = data,
      (error) => console.log(error)
    )
  }

}
