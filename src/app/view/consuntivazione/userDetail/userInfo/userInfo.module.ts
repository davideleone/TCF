import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { UserInfoComponent } from "./userInfo.component"
import { ButtonModule } from 'primeng/primeng';



@NgModule({
  declarations: [
    UserInfoComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    NgbModule.forRoot(),
    FormsModule,
    ButtonModule, 
    ReactiveFormsModule,
  ],
  exports: [UserInfoComponent],
  bootstrap: [UserInfoComponent]
})
export class UserInfoModule { }
