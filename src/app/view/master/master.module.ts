import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';

import { AppRoutingModule }     from '../../app-routing.module';

import { CustomHttpProvider } from '../../helpers/custom-http';

import { AuthGuard } from '../../security/auth.guard';
import { HeaderModule } from './header/header.module';
import { MasterComponent } from './master.component';
import { ToggleComponent } from './toggle/toggle.component';
import { LeftsideBarComponent } from './leftsidebar/leftsidebar.component';
import { RightsideBarComponent } from './rightsidebar/rightsidebar.component';

import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';
import { UsersComponent } from '../user/users.component';
import { ConsuntivazioneModule } from '../consuntivazione/consuntivazione.module';
import { GestioneUtentiModule } from '../amministrazione/gestioneUtenti/gestioneUtenti.module';
import { GestioneAttivitaModule } from '../amministrazione/gestioneAttivita/gestioneAttivita.module';


import { SubHeaderModule } from './subheader/subheader.module'
import { AuthenticationService } from '../../service/authentication.service';

import { ChangeEmailComponent } from '../user/changeemail/changeemail.component';
import { ChangePwdComponent } from '../user/changepwd/changepwd.component';


@NgModule({
  declarations: [
    MasterComponent,
    HomeComponent,
    LoginComponent,
    UsersComponent,
    ToggleComponent,
    LeftsideBarComponent,
    RightsideBarComponent,
    ChangeEmailComponent,
    ChangePwdComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    AppRoutingModule,
    HeaderModule,
    ConsuntivazioneModule,
    GestioneUtentiModule,
    GestioneAttivitaModule,
    SubHeaderModule,
    NgbModule.forRoot()
  ],
  providers: [
    AuthGuard,
    CustomHttpProvider,
    AuthenticationService
   ],
  bootstrap: [MasterComponent],
  exports: [MasterComponent],
})
export class MasterModule { 
}
