import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ChangePwdComponent } from "./changepwd.component"
import { ButtonModule } from 'primeng/primeng';



@NgModule({
  declarations: [
    ChangePwdComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    NgbModule.forRoot(),
    FormsModule,
    ButtonModule, 
    ReactiveFormsModule,
  ],
  exports: [ChangePwdComponent],
  bootstrap: [ChangePwdComponent]
})
export class ChangePwdModule { }
