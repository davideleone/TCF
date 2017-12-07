import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Injectable, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomainService } from '../../../service/domain.service';
import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../../service/cliente.service';
import { Cliente } from '../../../model/cliente';

import { ConfirmationService } from 'primeng/primeng';
import { AuthenticationService } from '../../../service/authentication.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'gestioneClienti',
  templateUrl: './gestioneClienti.component.html',
  styleUrls: ['./gestioneClienti.component.css'],
  providers: [FormBuilder, AuthenticationService, DomainService, ClienteService, ConfirmationService]
})

export class GestioneClientiComponent implements OnInit {

  clients: any;
  newClient: Cliente;
  ambitiComboBox: SelectItem[] = [];
  headerCliente: string;
  displayDialog: boolean = false;  
  startClientDate: string;
  endClientDate: string;
  clientIndex;
  clientForm: FormGroup;  
  formSubmitted: boolean = false;
  selectedAmbitis: SelectItem[] = [];


  constructor(
    private clientService: ClienteService,
    private domainService: DomainService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private confirmationService:ConfirmationService,
    private changeDetectionRef: ChangeDetectorRef) {
    
    this.newClient = new Cliente();
    this.selectedAmbitis = [];

    this.clientForm = this.formBuilder.group({
      nome_cliente: new FormControl('', Validators.required),
      dataInizio: new FormControl('', Validators.required),
      dataFine: new FormControl('', this.controlDateValidator),
    });

    domainService.getAmbiti().subscribe(ambiti =>
      {
        this.ambitiComboBox = ambiti;      
      }
    );
  }

  ngOnInit() {
    this.clientService.getClienti().subscribe(clients =>
      this.clients = clients);
  }


  /*Gestione click MODIFICA UTENTE*/
  editRow(rowData, rowIndex) {
    this.newClient = JSON.parse(JSON.stringify(rowData));
    this.newClient.data_inizio_validita = new Date(this.newClient.data_inizio_validita);
    this.newClient.data_fine_validita = this.newClient.data_fine_validita != null ? new Date(this.newClient.data_fine_validita) : null;
    this.newClient.ambiti.forEach(ambito => {
      if(ambito.id_ambito!=null)
        this.selectedAmbitis.push({ label: ambito.id_ambito, value: ambito.id_ambito }); //TODO charge also nome_ambito in service backend
    });

    this.headerCliente = "Modifica Cliente - " + this.newClient.nome_cliente;
    this.clientIndex = rowIndex;
    this.displayDialog = true;
  }

  /*Gestione click AGGIUNTA CLIENTE*/
  addNewClient() {
    this.newClient = new Cliente(); 
    this.newClient.ambiti = [{nome_ambito: null, id_ambito: null, data_inizio_validita: null, data_fine_validita: null}];   
    this.newClient.data_inizio_validita = new Date();
    this.formSubmitted = false;
    this.headerCliente = "Aggiungi Cliente";
    this.clientIndex = null;
    this.displayDialog = true;
    this.clientForm.reset();
  }

  saveNew() {
    let _ambito: SelectItem;
    
    this.selectedAmbitis.forEach(elem => {
      //this.newActivity.nome_cliente = this.lst_clienti.find(x => x.value == this.newActivity.id_cliente).label;
      this.newClient.ambiti.push({nome_ambito: elem.label, id_ambito: elem.value, data_inizio_validita: null, data_fine_validita: null});
    });
    
    this.clientService.addCliente(this.newClient).subscribe(
      client => {
        if (this.clientIndex == null) { //aggiunta
          this.clients.push(client);
        } else {
          this.clients[this.clientIndex] = client;
        }
        this.clients = JSON.parse(JSON.stringify(this.clients)); //deepcopy        
      });
    this.displayDialog = false;
  }


  //DELETE ROW
  private deleteRow(rowData, rowIndex) {
    var selCriteria;
    selCriteria = new Object();
    selCriteria._id = rowData._id;
    this.confirmationService.confirm({
      message: "Sei sicuro di voler eliminare il cliente '" + rowData.nome_cliente + "' ?",
      header: 'Elimina utente',
      icon: 'fa fa-trash',
      accept: () => {
        this.clientService.deleteCliente(selCriteria).subscribe(event => {
          this.clients.splice(rowIndex, 1);
          this.clients = JSON.parse(JSON.stringify(this.clients)); //deepcopy
          
        });
      }
    });
  }

  
  //VALIDATOR & UTILITY


  private controlDateValidator(control: FormControl) {
    let dataInizio = control.root.value['dataInizio'] != null ? control.root.value['dataInizio'] : null;
    let dataFine = control.value;
    if (dataInizio > dataFine && dataFine != null) {
      return { controlDate: true }
    }
    return null;
  }


  /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
  private checkForm(form) {
    //disabilito controlli in caso di modifica utente (psw non visibili)
    if (this.clientIndex != null) {
      this.clientForm.controls['password'].disable();
      this.clientForm.controls['confPassword'].disable();
    }    
    this.formSubmitted = true;
    return form.valid;
  }
  

  private isValid(componentName: string) {
    if ((this.clientForm.get(componentName).touched || this.formSubmitted) && this.clientForm.get(componentName).errors)
      return "#a94442";
    else
      return "#898989"; //#d6d6d6
  }

  private isModifica() {
    return this.clientIndex != null;
  }



 private abortNew() {
    this.displayDialog = false;
  }

}



