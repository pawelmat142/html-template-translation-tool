import { Component, OnInit, ViewChild } from '@angular/core';
import { TemplateComponent } from 'src/app/components/template/template.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {
  }

  @ViewChild(TemplateComponent) t: TemplateComponent| any

  translatedEvent(isTranslated: boolean) {
    if (isTranslated) {
      this.t.setBorderToTranslatedElement(isTranslated)
    }
  }

  generateTemplateEvent() {
    this.t.generateTemplateEvent()
  }

}
