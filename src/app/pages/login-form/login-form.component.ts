import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  @Output() toRegisterForm = new EventEmitter<void>()

  constructor(
    private auth: AuthenticationService,
    private router: Router
  ) { }

  loginForm = new FormGroup(
    {
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60)
      ]),
    },
  )

  get f() { return this.loginForm.controls }

  submitted = false;

  errorMsg = ''
  message = ''

  ngOnInit(): void {
  }

  async onSubmit() {
    console.log('onSubmit')
    try {
      if (this.loginForm.invalid) throw new Error('form invalid')

      let done = await this.auth.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      )
  
      if (done === true) {
        this.loginForm.value.email = ''
        this.loginForm.value.password = ''
        this.message = 'Login successful'
      } else throw new Error('authentication failed')
      
    } catch (error) {
      this.errorMsg = 'Login failed'
      setTimeout(() => this.errorMsg = '', 2000)
    }
  }


  async googleLogin() { 
    try { 

      let done = await this.auth.googleLogin()

      console.log(done)

      if (done === true) {
        this.message = 'Login successful'
      } else throw new Error('Login failed')

    } catch (error) {
      console.log('error')
      console.log(error)
      this.errorMsg = 'Login failed'
    }
  }


  async githubLogin() { 
    try { 

      let done = await this.auth.githubLogin()

      if (done === true) {
        this.message = 'Login successful'
      } else throw new Error('Login failed')

    } catch (error) {
      console.log('error')
      console.log(error)
      this.errorMsg = 'Login failed'
    }
  }

  
}
