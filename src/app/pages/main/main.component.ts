import { Component } from '@angular/core';
import { FileService } from 'src/app/services/file.service';

// MAIN VIEW AFTER AUTHORIZATION - CONTAINS TEMPLATE AND TOOLS

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  constructor() { 
  }

  originTexts: string[]

}
