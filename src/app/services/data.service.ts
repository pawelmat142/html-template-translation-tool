import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { LanguagesService } from './languages.service';
import { Observable, map, catchError, tap } from 'rxjs';
import { Collection } from '../models/collection';
import { Router } from '@angular/router';
import { deleteField } from "firebase/firestore";
import { DialogService } from './dialog.service';
import { getStorage, ref, uploadBytes, deleteObject, getBlob } from "firebase/storage"


// FIRESTORE INTERFACE

@Injectable({
  providedIn: 'root'
})
export class DataService {

  get uid(): string {
    let uid = localStorage.getItem('uid')
    if (!uid) this.router.navigate(['login'])
    return uid
  }

  constructor(
    private firestore: AngularFirestore,
    private language: LanguagesService,
    private router: Router,
    private dialog: DialogService,
  ) {

  }

  // PROJECTS

  getUserProjectsObs(): Observable<Collection[]> {
    return this.firestore
      .collection(`appProjects`)
      .doc(this.uid)
      .valueChanges()
      .pipe(
        map(this.parseToCollectionArr),
        catchError(error => this.handeError(error))
      ) as Observable<Collection[]>
  }

  async addProject(data: Collection, file: File) { 
    try { 
      await this.uploadFile(file)
      await this.firestore
        .collection('appProjects')
        .doc(this.uid)
        .update({ [data.name]: data })
      
      return true
      
    } catch (error) { 
      console.log(error)
      return false
    }
  }

  async deleteProject(name: string, filename: string) { 
    await this.askIfSure()
    await this.deleteFile(filename)
    await this.firestore
      .collection('appProjects')
      .doc(this.uid)
      .update({ [name]: deleteField() })
  }


  // FILE STORAGE
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

  // IDENTIFIERS

  async getDocByIdentifier(identifier: string, projectName: string) {
    try { 
      let data = await this.firestore
        .collection(`/${projectName}`)
        .doc(identifier)
        .ref.get()
      
      if (data.exists) {
        let result = data.data() as any
        result.identifier = identifier
        return result
      } else throw new Error('doc doesnt exists')

    } catch (error) {
      console.log(error)
      return false
    }
  }
  
  async addElementIdentifier(originText: string, projectName: string) {
    try {
      
      let identifier = this.firestore.createId()
      let data = { [this.language.origin]: originText }
      
      let result = await this.firestore
        .collection(`/${projectName}`)
        .doc(identifier)
        .set(data)
      
      console.log(result)
      
      return identifier as string

    } catch (error) { 
      console.log(error)
      return false
    }
  }


  async removeIdentifier(projectName: string, identifier: string) {
    try {
      await this.firestore
        .collection(projectName)
        .doc(identifier)
        .delete()
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }



  // OTHERS

  askIfSure() {
    return new Promise(resolve => {
      this.dialog.setDialogWithConfirmButton(
        'Warning!',
        'Are you sure you want to delete this project?',
        resolve,
      )
    })
  }

  async addTranslation(
    identifier: string,
    language: string,
    text: string,
    projectName: string
  ) {
    try { 
      this.firestore
        .collection(`/${projectName}`)
        .doc(identifier)
        .update({[language]: text})
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  private parseToCollectionArr(input: any): Collection[] {
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