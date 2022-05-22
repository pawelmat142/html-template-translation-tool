import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';

// FIREBASE
import { AngularFireModule } from '@angular/fire/compat';
import { AuthenticationService } from './services/authentication.service';
import { SecureInnerPagesGuard } from './providers/SecureInnerPages';
import { AuthGuard } from './providers/AuthGuard';

// PAGES
import { MainComponent } from './pages/main/main.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { GoToDesktopComponent } from './pages/go-to-desktop/go-to-desktop.component'
import { ProjectsComponent } from './pages/projects/projects.component';

// COMPONENTS
import { ToolComponent } from './components/tool/tool.component';
import { TemplateComponent } from './components/template/template.component';
import { DialogComponent } from './components/dialog/dialog.component';

// PIPES
import { TittlecasePipe } from './pipes/tittlecase.pipe';
import { ReportComponent } from './pages/report/report.component';


@NgModule({
  declarations: [
    AppComponent,
    RegisterFormComponent,
    LoginFormComponent,
    MainComponent,
    GoToDesktopComponent,
    ToolComponent,
    TemplateComponent,
    TittlecasePipe,
    DialogComponent,
    ProjectsComponent,
    ReportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,

    // FIREBASE
    AngularFireModule.initializeApp(environment.firebase),

  ],
  exports: [],
  providers: [AuthenticationService, AuthGuard, SecureInnerPagesGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
