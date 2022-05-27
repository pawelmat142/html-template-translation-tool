import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TemplateComponent } from 'src/app/components/template/template.component';
import { TemplateService } from 'src/app/services/template.service';

// MAIN VIEW AFTER AUTHORIZATION - CONTAINS TEMPLATE AND TOOLS

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  constructor( ) { }
}
