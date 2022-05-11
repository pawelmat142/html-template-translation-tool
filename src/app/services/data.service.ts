import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { TemplateService } from './template.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private collection = 'test' 

  constructor(
    private firestore: AngularFirestore,
  ) {
    // this.subscribeFileName()
  }

  setCollectionName(collection: string) {
    this.collection = collection
  }


  async addElementIdentifier(originLanguage: string, text: string) {
    try {

      let identifier = this.firestore.createId()

      let data = {
        [originLanguage]: text
      }

      await this.firestore.collection(`/${this.collection}`).doc(identifier).set(data)

      return identifier as string

    } catch (error) { 
      console.log(error)
      return false
    }
  }


  async addTranslation(identifier: string, language: string, text: string) {
    try { 

      this.firestore
        .collection(`/${this.collection}`)
        .doc(identifier)
        .update({[language]: text})
      
      return true

    } catch (error) {
      console.log(error)
      return false
    }
  }


  // subscribeFileName() { 
  //   this.template.getFileName().subscribe(
  //     data => this.fileName = data,
  //     error => console.log(error)
  //   )
  // }


}


interface Identifier {
  id: string;
  english: string;
  polish: string;
}
