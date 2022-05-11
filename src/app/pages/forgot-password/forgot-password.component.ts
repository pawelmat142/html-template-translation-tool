import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    private router: Router,
    private auth: AuthenticationService
  ) { }

  forgotPasswordForm = new FormGroup(
    {
      email: new FormControl('', [
        Validators.required,
        Validators.email]),
    }
  )

  get f() { return this.forgotPasswordForm.controls }

  submitted = false;

  errorMsg = ''
  message = ''

  ngOnInit(): void {
  }

  async onSubmit() {
    try {
      if (this.forgotPasswordForm.invalid) throw new Error('form invalid')

      let done = await this.auth
        .forgotPassword(this.forgotPasswordForm.value.email)
  
      if (done === true) {
        this.forgotPasswordForm.value.email = ''
        this.message = 'Link has sent on your registered email. Please verify it.'
      } else throw new Error()
      
    } catch (error) {
      this.errorMsg = 'Restore password failed'
      setTimeout(() => this.errorMsg = '', 2000)
    }
  }

}
