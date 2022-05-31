import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Language } from '../models/language';
const SEPARATOR = '<!-- separator -->'

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private templateConentObs = new BehaviorSubject<string>('')
  getTemplateConentObs() { return this.templateConentObs.asObservable() }
  
  private file: File
  private fileAsString: string

  private top: string
  private head: string
  private body: string

  constructor() { }

  triggerInitTemplate() { 
    console.log('triggerInitTemplate')
    this.templateConentObs.next(this.getTemplateConent())
  }

  async initFile(file: File): Promise<void> {
    console.log('init file')
    this.file = file
    this.fileAsString = file ? await file.text() : ''
    this.sliceFile()
    this.triggerInitTemplate()
  }

  private sliceFile(): void { 
    this.top = this.fileAsString.split('<head').shift()
    this.head = this.fileAsString.match(/<head[^>]*>[\s\S]*<\/head>/gi).pop()
    this.body = this.fileAsString.match(/<body[^>]*>[\s\S]*<\/body>/gi).pop()
  }

  private getTemplateConent(): string {
    return this.head + '\n'+ SEPARATOR + '\n' + this.body
  }

  refresh(ref: HTMLElement): File {
    this.generateFileAsString(ref)
    this.file = new File(
      [this.fileAsString],
      this.file.name,
      {type: 'text/html'}
    )
    return this.file
  }
    
  private generateFileAsString(ref: HTMLElement): void { 
    const bodyTag = this.fileAsString.match(/<body[^>]*>/gi).pop()
    this.head = ref.innerHTML.split(SEPARATOR).shift()
    this.body = ref.innerHTML.split(SEPARATOR).pop()
    this.fileAsString = `${this.top}\n<head>\n${this.head}\n</head>\n${bodyTag}\n${this.body}\n</body>`
  }

  generateTemplate(ref: HTMLElement, language: Language): void {
    const bodyTag = this.fileAsString.match(/<body[^>]*>/gi).pop()
    let head = ref.innerHTML.split(SEPARATOR).shift()
    let body = ref.innerHTML.split(SEPARATOR).pop()
    let fileAsTxt = `${this.top}\n<head>\n${head}\n</head>\n${bodyTag}\n${body}\n</body>`

    const filename = this.file.name.split('.')[0] + '_' + language.code + '.html'
    
    let translatedFile = new File(
      [fileAsTxt],
      filename,
      {type: 'text/html'}
    )
    this.download(translatedFile)
  }

  clear(): void {
    this.file = null
    this.fileAsString = ''
    this.top = ''
    this.head = ''
    this.body = ''
  }

  download = (file: File) => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = file.name
    document.body.append(link)
    link.click()
    link.remove()
  }
}


