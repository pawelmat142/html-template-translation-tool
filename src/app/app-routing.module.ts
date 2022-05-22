import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoToDesktopComponent } from './pages/go-to-desktop/go-to-desktop.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { MainComponent } from './pages/main/main.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { ReportComponent } from './pages/report/report.component';
import { AuthGuard } from './providers/AuthGuard';
import { SecureInnerPagesGuard } from './providers/SecureInnerPages';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },    //prefix / full
  {
    path: 'login',
    component: LoginFormComponent,
    canActivate: [SecureInnerPagesGuard],
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuard],
  },
  { path: 'register', component: RegisterFormComponent },
  { path: 'go-to-desktop', component: GoToDesktopComponent },
  { path: 'report', component: ReportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
