import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
//import { AppRoutingModule }     from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { GestioneCommClienteComponent } from './gestioneCommCliente.component';
import { InputTextareaModule, ConfirmDialogModule, AccordionModule, CalendarModule, DataTableModule, SharedModule, DialogModule, InputTextModule, DropdownModule, MultiSelectModule} from 'primeng/primeng';


@NgModule({
  declarations: [
    GestioneCommClienteComponent
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
    ReactiveFormsModule,
    InputTextareaModule
  ],
  providers: [],
  exports: [GestioneCommClienteComponent],
  bootstrap: [GestioneCommClienteComponent]
})
export class GestioneCommClienteModule { }
