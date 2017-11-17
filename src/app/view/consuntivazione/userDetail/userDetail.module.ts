import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { UserDetailComponent } from './userDetail.component';
import { UserInfoComponent } from './userInfo/userInfo.component';
import { MonthGridModule} from './monthGrid/monthGrid.module';
import { MonthListComponent } from './monthList/monthList.component';

//import { CustomHttpProvider } from '../../../helpers/custom-http';



@NgModule({
  declarations: [
    UserDetailComponent,
    UserInfoComponent,
    MonthListComponent,

  ],
  imports: [
    BrowserModule,
    HttpModule,
    //AppRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
    MonthGridModule
  ],
  providers: [
    //CustomHttpProvider,
    ],
  exports: [UserDetailComponent],
  bootstrap: [UserDetailComponent]
})
export class UserDetailModule { }
