import { TranslationElement } from "./translationElement";

export interface Collection { 
  name: string,
  filename: string,
  modified: string,
  originLanguage: string,
  translations?: TranslationElement[]
}