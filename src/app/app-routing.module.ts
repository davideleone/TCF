import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 
import { AppComponent } from './app.component';
import { AuthGuard } from './security/auth.guard';
import { HomeComponent } from './view/home/home.component';
import { LoginComponent } from './view/login/login.component';
import { ConsuntivazioneComponent } from './view/consuntivazione/consuntivazione.component';
import { ChangeEmailComponent } from './view/user/changeemail/changeemail.component';
import { ChangePwdComponent } from './view/user/changepwd/changepwd.component';
import { GestioneUtentiComponent } from './view/amministrazione/gestioneUtenti/gestioneUtenti.component';
import { GestioneAttivitaComponent } from './view/amministrazione/gestioneAttivita/gestioneAttivita.component';
import { GestioneCommClienteComponent } from './view/amministrazione/gestioneCommCliente/gestioneCommCliente.component';
import { GestioneCommFinconsComponent } from './view/amministrazione/gestioneCommFincons/gestioneCommFincons.component';
import { GestioneClientiComponent } from './view/amministrazione/gestioneClienti/gestioneClienti.component';
import { ReportComponent } from './view/report/report.component';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'utenti', component: GestioneUtentiComponent, canActivate: [AuthGuard]},
  { path: 'consuntivazione', component: ConsuntivazioneComponent, canActivate: [AuthGuard] },
  { path: 'userChangeEmail', component: ChangeEmailComponent, canActivate: [AuthGuard] },
  { path: 'userChangePwd', component: ChangePwdComponent, canActivate: [AuthGuard] },
  { path: 'attivita', component: GestioneAttivitaComponent, canActivate: [AuthGuard]},
  { path: 'commesse', component: GestioneCommClienteComponent, canActivate: [AuthGuard]},
  { path: 'commesseFincons', component: GestioneCommFinconsComponent, canActivate: [AuthGuard]},
  { path: 'clienti', component: GestioneClientiComponent, canActivate: [AuthGuard]},
  { path: 'report', component: ReportComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '' }
];
 
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}