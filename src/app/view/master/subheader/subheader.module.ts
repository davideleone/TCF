import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppRoutingModule }     from '../../../app-routing.module';
import { FormsModule }   from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { SubHeaderComponent } from './subheader.component';
import { SitemapComponent } from './sitemap/sitemap.component';
import { TipoUtenteComponent } from './tipoUtente/tipoUtente.component';
import { CustomHttpProvider } from '../../../helpers/custom-http';



@NgModule({
  declarations: [
    TipoUtenteComponent,
    SitemapComponent,
    SubHeaderComponent
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
  exports: [SubHeaderComponent],
  bootstrap: [SubHeaderComponent]
})
export class SubHeaderModule { }
