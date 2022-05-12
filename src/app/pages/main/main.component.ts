import { Component, OnInit, ViewChild } from '@angular/core';
import { TemplateComponent } from 'src/app/components/template/template.component';
import { ToolComponent } from 'src/app/components/tool/tool.component';

// MAIN VIEW AFTER AUTHORIZATION - CONTAINS TEMPLATE AND TOOLS

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {}
}
