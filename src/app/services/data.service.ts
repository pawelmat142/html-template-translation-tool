import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { LanguagesService } from './languages.service';
import { BehaviorSubject, Observable } from 'rxjs';


// FIRESTORE INTERFACE

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _collection = 'test'
  private collectionObs = new BehaviorSubject<string>('');

  constructor(
    private firestore: AngularFirestore,
    private language: LanguagesService
  ) { }

  set collection(c: string) {
    this._collection = c
    this.collectionObs.next(c)
  }

  get collection(): string { 
    return this._collection
  }

  getCollectionObs(): Observable<string> {
    return this.collectionObs.asObservable()
  }


  async addElementIdentifier(originText: string) {
    try {

      console.log(this.collection)

      let identifier = this.firestore.createId()
      let data = { [this.language.origin]: originText }
      
      await this.firestore
        .collection(`/${this.collection}`)
        .doc(identifier)
        .set(data)
      
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
}