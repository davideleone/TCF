import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgModule, ErrorHandler } from '@angular/core';
import { environment } from '../environments/environment';

import { CustomHttpProvider } from './helpers/custom-http';
import { AppComponent } from './app.component';
import { MasterModule } from './view/master/master.module';

import { JL } from 'jsnlog';

//LOGGER SETTING
export class MyUncaughtExceptionHandler implements ErrorHandler {
  handleError(error: any) {
      JL().fatalException('Arch Uncaught Exception', error.message);      
  }
};      

//per setting header custom
var addRequestHeaders = function (xhr: XMLHttpRequest) {
  //console.log(json);
  //xhr.setRequestHeader('Access-Control-Allow-Origin', 'true');
};


// Set the level of the nameless loggr to INFO, so only log items
// with severity WARN or higher get logged.
var ajaxAppender = JL.createAjaxAppender('ajaxAppender')
                     .setOptions({"beforeSend": addRequestHeaders});
var consoleAppender = JL.createConsoleAppender('consoleAppender');

JL().setOptions({ "level": environment.logLevel, "appenders": [ajaxAppender, consoleAppender] });
JL.setOptions({ "defaultAjaxUrl": environment.apiUrl + environment.loggerApiUrl });

/*
if (typeof window !== 'undefined' && !window.onerror) {
  window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
      // Send object with all data to server side log, using severity fatal, 
      // from logger "onerrorLogger"
      JL("MyOnerrorLogger").fatalException({
          "msg": "Uncaught Exception",
          "errorMsg": errorMsg, "url": url,
          "line number": lineNumber, "column": column
      }, errorObj);

      // Tell browser to run its own error handler as well   
      return false;
  }
}*/

@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    MasterModule,
    NgbModule.forRoot()
  ],
  providers: [
    CustomHttpProvider,
    { provide: 'JSNLOG', useValue: JL },
    { provide: ErrorHandler, useClass: MyUncaughtExceptionHandler }
   ],
  bootstrap: [AppComponent]
})
export class AppModule { 
}
