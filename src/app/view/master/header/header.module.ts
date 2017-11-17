import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppRoutingModule }     from '../../../app-routing.module';
import { FormsModule }   from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { ListMenuComponent } from './listmenu/listmenu.component';

import { CustomHttpProvider } from '../../../helpers/custom-http';



@NgModule({
  declarations: [
    ListMenuComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
  //  FormsModule,
    AppRoutingModule,
    NgbModule.forRoot()
  ],
  providers: [
    CustomHttpProvider,
    ],
  exports: [HeaderComponent],
  bootstrap: [HeaderComponent]
})
export class HeaderModule { }
