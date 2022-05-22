import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { LanguagesService } from './languages.service';
import { Observable, map, catchError } from 'rxjs';
import { Collection } from '../models/collection';
import { Router } from '@angular/router';
import { deleteField, doc } from "firebase/firestore";
import { DialogService } from './dialog.service';
import { getStorage, ref, uploadBytes, deleteObject, getBlob } from "firebase/storage"
import { TranslationElement } from '../models/translationElement';


// FIRESTORE INTERFACE

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private firestore: AngularFirestore,
    private language: LanguagesService,
    private router: Router,
    private dialog: DialogService,
  ) { }
  
  get uid(): string {
    let uid = localStorage.getItem('uid')
    if (!uid) this.router.navigate(['login'])
    return uid
  }

  get newId(): string { return this.firestore.createId() }
  

  // PROJECTS

  getUserProjectsObs(): Observable<Collection[]> {
    return this.firestore
      .collection(this.uid)
      .valueChanges()
      .pipe(
        map(this.parseToProjectsArr),
        catchError(error => this.handeError(error))
      ) as Observable<Collection[]>
  }

  async addProject(project: Collection) { 
    return await this.firestore
      .collection(this.uid)
      .doc(project.name)
      .set(project)
  }

  async updateProject(project: Collection) { 
    return await this.firestore
      .collection(this.uid)
      .doc(project.name)
      .update(project)
  }

  async removeUserProject(name: string) { 
    const translations = this.firestore.firestore
      .collection(this.uid)
      .doc(name)
      .collection('translations')
    await this.clearCollection(translations)
    return await this.firestore
      .collection(this.uid)
      .doc(name)
      .delete()
  }

  // async getProject(projectName: string) { 
  //   return await this.firestore
  //     .collection(this.uid)
  //     .doc(projectName)
  //     .ref.get()
  // }

  // IDENTIFIERS

  async addTranslationDocs(projectName: string, language: string, translationElements: TranslationElement[]) {
    let batch = this.firestore.firestore.batch()
    translationElements.forEach(el => { 
      let docRef = this.firestore
        .collection(this.uid)
        .doc(projectName)
        .collection('translations')
        .doc(el.identifier).ref
      batch.set(docRef, el)
    })
    await batch.commit()
  }


  async updateTranslationDocs(projectName: string, translationElements: TranslationElement[]) {
    let batch = this.firestore.firestore.batch()
    translationElements.forEach(el => { 
      let docRef = this.firestore
        .collection(this.uid)
        .doc(projectName)
        .collection('translations')
        .doc(el.identifier).ref
      batch.update(docRef, el)
    })
    await batch.commit()
  }

  async getProjectTranslationDocs(projectName: string) { 
    let result: TranslationElement[] = []
    let snapshot = await this.firestore
      .collection(this.uid)
      .doc(projectName)
      .collection('translations')
      .ref.get()
    snapshot.forEach(el => result
      .push(el.data() as TranslationElement))
    return result
  }

  async deleteTranslationDoc(projectName: string, identifier: string) { 
    return await this.firestore
      .collection(this.uid)
      .doc(projectName)
      .collection('translations')
      .doc(identifier)
      .delete()
  }

  async deleteTranslationDocuments(projectName: string, identifiers: string[]) { 
    let batch = this.firestore.firestore.batch()
    identifiers.forEach(identifier => { 
      let docRef = this.firestore
        .collection(this.uid)
        .doc(projectName)
        .collection('translations')
        .doc(identifier).ref
      batch.delete(docRef)
    })
    return await batch.commit()
  }


  // TRANSLATIONS

  async updateTranslationDoc(
    projectName: string,
    identifier: string,
    translateToLanguage: string,
    texts: string[]
  ) { 
    return await this.firestore
      .collection(this.uid)
      .doc(projectName)
      .collection('translations')
      .doc(identifier)
      .update({[translateToLanguage]: texts})
  }



  // FILE STORAGE - templates

  async uploadFile(file: File) { 
    const storage = getStorage()
    const fileRef = ref(storage, `${this.uid}/${file.name}`)
    uploadBytes(fileRef, file)
      .then(() => { return })
      .catch(error => this.handeError(error))
  }
  
  async deleteFile(filename: string) {
    const storage = getStorage()
    const fileRef = ref(storage, `${this.uid}/${filename}`)
    deleteObject(fileRef)
      .then(() => { return })
      .catch(error => this.handeError(error))
  }
    
  async downloadFile(filename: string) {
    try { 
      const storage = getStorage()
      const fileRef = ref(storage, `${this.uid}/${filename}`)
      let blob = await getBlob(fileRef)
      let file = new File([blob], filename)
      return file
    } catch (error) {
      this.handeError(error)
      return null
    }
  }


  // OTHERS
  async clearCollection(ref) {
    return await ref.onSnapshot((snapshot) => {
      snapshot.docs.forEach((doc) => {
        ref.doc(doc.id).delete()
      })
    })
  }

  private parseToProjectsArr(input: any): Collection[] {
    let result: Collection[] = []
    if (input) {
      for (let r in input) {
        result.push(input[r] as Collection)
      }
    }
    return result
  }

  async handeError(error: Error) {
    console.log(error.message)
  }

}