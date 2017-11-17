import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { GestioneUtentiComponent } from './gestioneUtenti.component';
import { ConfirmDialogModule, AccordionModule, CalendarModule, DataTableModule, SharedModule, DialogModule, InputTextModule, DropdownModule, MultiSelectModule} from 'primeng/primeng';




@NgModule({
  declarations: [
    GestioneUtentiComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    NgbModule.forRoot(),
    FormsModule,
    DataTableModule, 
    SharedModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    AccordionModule,
    ConfirmDialogModule,
    ReactiveFormsModule
  ],
  providers: [],
  exports: [GestioneUtentiComponent],
  bootstrap: [GestioneUtentiComponent]
})
export class GestioneUtentiModule { }
