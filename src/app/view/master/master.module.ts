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

import { HomeModule } from '../home/home.module';
import { LoginModule } from '../login/login.module'
import { ConsuntivazioneModule } from '../consuntivazione/consuntivazione.module';
import { GestioneUtentiModule } from '../amministrazione/gestioneUtenti/gestioneUtenti.module';
import { GestioneAttivitaModule } from '../amministrazione/gestioneAttivita/gestioneAttivita.module';
import { GestioneCommClienteModule } from '../amministrazione/gestioneCommCliente/gestioneCommCliente.module';
import { GestioneCommFinconsModule } from '../amministrazione/gestioneCommFincons/gestioneCommFincons.module';
import { GestioneClientiModule } from '../amministrazione/gestioneClienti/gestioneClienti.module';
import { ReportModule } from '../report/report.module';
import { SubHeaderModule } from './subheader/subheader.module'
import { AuthenticationService } from '../../service/authentication.service';

import { ChangeEmailModule } from '../user/changeemail/changeemail.module';
import { ChangePwdModule } from '../user/changepwd/changepwd.module';
import { InputTextModule } from 'primeng/primeng';

@NgModule({
  declarations: [
    MasterComponent,
    
    ToggleComponent,
    LeftsideBarComponent,
    RightsideBarComponent
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
    GestioneCommClienteModule,
    GestioneCommFinconsModule,
    GestioneClientiModule,
    LoginModule,
    SubHeaderModule,
    InputTextModule,
    ChangeEmailModule,
    ChangePwdModule,
    ReportModule,
    HomeModule,
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
