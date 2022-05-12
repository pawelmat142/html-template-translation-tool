// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ReadFileService } from "src/app/services/read-file.service";

export const environment = {
  production: false,

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  firebase: {
    apiKey: "AIzaSyB5MWLxPvf_Jxxp5cWqS4DwzpimEaNGNQA",
    authDomain: "html-translator-d72f3.firebaseapp.com",
    databaseURL: "https://html-translator-d72f3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "html-translator-d72f3",
    storageBucket: "html-translator-d72f3.appspot.com",
    messagingSenderId: "96638802282",
    appId: "1:96638802282:web:d5dc85528f936007972d13",
    measurementId: "G-8GEJCYV696"
  }

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

