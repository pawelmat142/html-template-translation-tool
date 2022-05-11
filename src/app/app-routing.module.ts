import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { GoToDesktopComponent } from './pages/go-to-desktop/go-to-desktop.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { MainComponent } from './pages/main/main.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { VarifyEmailComponent } from './pages/varify-email/varify-email.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full'},    //prefix / full
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'register', component: RegisterFormComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'varify-email', component: VarifyEmailComponent },
  { path: 'go-to-desktop', component: GoToDesktopComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
