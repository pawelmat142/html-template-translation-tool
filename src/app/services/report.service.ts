import { Injectable } from '@angular/core';
import { TranslationElement } from '../models/translationElement';


@Injectable({
  providedIn: 'root'
})
export class ReportService {

  elements: TranslationElement[] = []
  purpose: string 

  constructor() { }
}
