import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/providers/validators';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {

  constructor(
    private auth: AuthenticationService,
    private router: Router
  ) { }

  registerForm = new FormGroup(
    {
      email: new FormControl('', [
        Validators.required,
        Validators.email]),
      confirmEmail: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }
  )

  get f() { return this.registerForm.controls }

  submitted = false;

  errorMsg = ''
  message = ''

  ngOnInit(): void {
  }

  async onSubmit() {
    try {
      if (this.registerForm.invalid) throw new Error('form invalid')
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        throw new Error('Password doesnt match')
      }
      if (this.registerForm.value.email !== this.registerForm.value.confirmEmail) {
        throw new Error('Email doesnt match')
      }

      let done = await this.auth.register(
        this.registerForm.value.email,
        this.registerForm.value.password
      )
  
      if (done === true) {
        this.registerForm.value.email = ''
        this.registerForm.value.password = ''
        this.message = 'Register successful'
      } else throw new Error()
      
    } catch (error) {
      this.errorMsg = 'Registration failed'
      setTimeout(() => this.errorMsg = '', 2000)
    }
  }

}
