import { Component, ElementRef, ViewChild } from '@angular/core';
import { ManualComponent } from 'src/app/components/manual/manual.component';

// MAIN VIEW - CONTAINS LOADED PROJECT TEMPLATE AND TOOLS

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  constructor() { }

  originTexts: string[]


  // MANUAL COMPONENT

  @ViewChild(ManualComponent) manualRef: ManualComponent

  manualActive = false

  openManual() {
    if (this.manualActive) {
      console.log(this.manualRef)
      this.manualRef.class = 'manual-hide'
      setTimeout(() => this.manualActive = false, 300)
    } else { 
      this.manualActive = true
    }
  }

}
