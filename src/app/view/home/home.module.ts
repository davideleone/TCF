import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { HomeComponent } from "./home.component"
import { ChartModule } from 'primeng/primeng';



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    NgbModule.forRoot(),
    FormsModule,
    ChartModule, 
    ReactiveFormsModule,
  ],
  exports: [HomeComponent],
  bootstrap: [HomeComponent]
})
export class HomeModule { }
