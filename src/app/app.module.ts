import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';

// FIREBASE
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore';

// PAGES
import { MainComponent } from './pages/main/main.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { VarifyEmailComponent } from './pages/varify-email/varify-email.component';
import { GoToDesktopComponent } from './pages/go-to-desktop/go-to-desktop.component'

import { ToolComponent } from './components/tool/tool.component';
import { HeaderComponent } from './components/header/header.component';
import { TemplateComponent } from './components/template/template.component';

import { TittlecasePipe } from './pipes/tittlecase.pipe';
import { DialogComponent } from './components/dialog/dialog.component';



// import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
// import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// import { environment } from '../environments/environment';
// import { provideAuth, getAuth } from '@angular/fire/auth';


@NgModule({
  declarations: [
    AppComponent,
    RegisterFormComponent,
    LoginFormComponent,
    MainComponent,
    ForgotPasswordComponent,
    VarifyEmailComponent,
    GoToDesktopComponent,
    ToolComponent,
    HeaderComponent,
    TemplateComponent,
    TittlecasePipe,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,

    MatIconModule,
    NoopAnimationsModule,

    // FIREBASE
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,

    // provideFirebaseApp(() => initializeApp(environment.firebase)),
    // provideFirestore(() => getFirestore()),
    // provideAuth(() => getAuth()),
  ],
  exports: [
    MatIconModule,
    NoopAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
