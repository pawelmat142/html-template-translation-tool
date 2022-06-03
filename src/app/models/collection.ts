import { TranslationElement } from "./translationElement";

export interface Collection { 
  name: string,
  filename: string,
  cssName: string
  modified: string,
  originLanguage: string,
  translations?: TranslationElement[],
}