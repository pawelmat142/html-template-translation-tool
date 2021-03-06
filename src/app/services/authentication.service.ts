import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { GoogleAuthProvider, GithubAuthProvider, User } from '@angular/fire/auth'
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private user: User = null

  constructor(
    private fireauth: AngularFireAuth,
    private router: Router,
  ) { 
    
    this.getUserState().subscribe(result => {
      if (result) {
        this.user = result
        localStorage.setItem('uid', this.user.uid)
        setTimeout(() =>this.router.navigate['projects'],200)
      }
      else { 
        this.user = null
        localStorage.removeItem('uid')
        this.router.navigate(['login'])
      }
    })
  }
  
  getUserState(): Observable<any> { 
    return this.fireauth.authState
  }
  
  get logged(): boolean {
    return this.user !== null ? true : false;
  }

  get uid(): string {
    return this.user.uid
  }

  async login(email: string, password: string) { 
    try {
      let result = await this.fireauth
        .signInWithEmailAndPassword(email, password)
      
      if (result.user) {
        setTimeout(() => this.router.navigate(['projects']), 1000)
      } 
      return true
    } catch (error) { return error }
  }

  async register(email: string, password: string) { 
    try { 
      let result = await this.fireauth
        .createUserWithEmailAndPassword(email, password)
      this.router.navigate(['login'])
      return true
    } catch (error) { return error }
  }

  async logout() { 
    try {
      
      let result = await this.fireauth.signOut()
      return true
    }
    catch (error) { 
      console.log(error)
      return false
    }
  }

  async deleteAccount() { 
    try {
      await this.user.delete()
    }
    catch (error) { 
      await this.fireauth.signOut()
    }
  }


  async googleLogin() { 
    try {

      let result = await this.fireauth
        .signInWithPopup(new GoogleAuthProvider)

      this.user = result.user
      localStorage.setItem('uid', this.user?.uid)
      this.router.navigate(['main'])

      return true

    } catch (error) {
      console.log(error)
      return false 
    }
  }


  async githubLogin() { 
    try {

      let result = await this.fireauth
        .signInWithPopup(new GithubAuthProvider)
      console.log('result')
      console.log(result)

      this.router.navigate(['main'])
      localStorage.setItem('token', JSON.stringify(result.user?.uid))

      return true

    } catch (error) {
      console.log(error)
      return false 
    }
  }

}