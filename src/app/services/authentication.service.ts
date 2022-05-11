import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { GoogleAuthProvider, GithubAuthProvider } from '@angular/fire/auth'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private fireauth: AngularFireAuth,
    private router: Router
  ) { }


  async login(email: string, password: string) { 
    try {

      let result = await this.fireauth
        .signInWithEmailAndPassword(email, password)
      
      localStorage.setItem('token', 'true')

      if (result.user?.emailVerified == true) {
        setTimeout(() => this.router.navigate(['main']), 300)
      } else { 
        setTimeout(() => this.router.navigate(['varify-email']), 300)
      }
      
      return true

    } catch (error) { return error }
  }


  async register(email: string, password: string) { 
    try { 
      
      let result = await this.fireauth
        .createUserWithEmailAndPassword(email, password)
      await this.sendEmailVerification(result.user)

      return true

    } catch (error) { return error }
  }


  async logout() { 
    try {

      let result = await this.fireauth.signOut()
      this.router.navigate(['login'])
      localStorage.removeItem('token')
    
      return true
    }
    catch (error) { 
      console.log(error)
      return false
    }
  }



  async forgotPassword(email: string) {
    try { 

      let result = await this.fireauth
        .sendPasswordResetEmail(email)
      
      this.router.navigate(['varify-email'])
      
      return true
      
    } catch (error) {
      return false
    }
  }



  async sendEmailVerification(user: any) {
    try { 

      let result = await user.sendEmailVerification()
      setTimeout(() => this.router.navigate(['varify-email']), 1000)
      
      return true

    } catch (error) {
      return false
    }
  }



  async googleLogin() { 
    try {

      let result = await this.fireauth
        .signInWithPopup(new GoogleAuthProvider)
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



  // async 


}
