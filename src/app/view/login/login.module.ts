import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { DialogModule, InputTextModule, ButtonModule } from 'primeng/primeng';




@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    NgbModule.forRoot(),
    FormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
  ],
  providers: [],
  exports: [LoginComponent],
  bootstrap: [LoginComponent]
})
export class LoginModule { }
