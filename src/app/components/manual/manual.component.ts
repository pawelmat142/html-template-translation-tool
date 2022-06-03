import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.css']
})
export class ManualComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @HostBinding('class') class: string = 'manual-show'

}
