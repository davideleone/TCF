import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ReportComponent } from './report.component';
import { CalendarModule, DropdownModule, DialogModule } from 'primeng/primeng';


@NgModule({
    declarations: [
        ReportComponent
    ],
    imports: [
      BrowserModule,
      HttpModule,
      NgbModule.forRoot(),
      FormsModule,
      DropdownModule,
      CalendarModule,
      DialogModule,
      ReactiveFormsModule
    ],
    providers: [],
    exports: [ReportComponent],
    bootstrap: [ReportComponent]
  })
  export class ReportModule { }
  