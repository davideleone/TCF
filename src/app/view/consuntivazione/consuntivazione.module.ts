import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule }   from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ConsuntivazioneComponent } from './consuntivazione.component';
import { UserListComponent } from './userList/userList.component';
import { UserDetailModule } from './userDetail/userDetail.module';
import { SearchUser } from './userList/userList.component';
//import { CustomHttpProvider } from '../../../helpers/custom-http';



@NgModule({
  declarations: [
    ConsuntivazioneComponent,
    UserListComponent,
    SearchUser
  ],
  imports: [
    BrowserModule,
    HttpModule,
    //AppRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
    UserDetailModule,
  ],
  providers: [
    //CustomHttpProvider,
    ],
  exports: [ConsuntivazioneComponent],
  bootstrap: [ConsuntivazioneComponent]
})
export class ConsuntivazioneModule { }
