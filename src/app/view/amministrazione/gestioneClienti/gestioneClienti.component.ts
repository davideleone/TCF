import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Injectable, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomainService } from '../../../service/domain.service';
import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../../service/cliente.service';
import { AttivitaService } from '../../../service/attivita.service'
import { Cliente } from '../../../model/cliente';
import { Attivita } from '../../../model/attivita';

import { ConfirmationService } from 'primeng/primeng';
import { AuthenticationService } from '../../../service/authentication.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { User } from '../../../model/user';

@Component({
  selector: 'gestioneClienti',
  templateUrl: './gestioneClienti.component.html',
  styleUrls: ['./gestioneClienti.component.css'],
  providers: [AttivitaService, FormBuilder, AuthenticationService, DomainService, ClienteService, ConfirmationService]
})

export class GestioneClientiComponent implements OnInit {
  userLogged: User;
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
  selectedAmbitis: any;
  alertDialog: boolean = false;
  alertMsg: string;



  constructor(
    private attivitaService: AttivitaService,
    private clientService: ClienteService,
    private domainService: DomainService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private changeDetectionRef: ChangeDetectorRef) {

    this.newClient = new Cliente();
    this.selectedAmbitis = [];

    this.clientForm = this.formBuilder.group({
      nome_cliente: new FormControl('', Validators.required),
      dataInizio: new FormControl('', Validators.required),
      dataFine: new FormControl('', this.controlDateValidator),
    });

    domainService.getAmbiti().subscribe(ambiti => {
      this.ambitiComboBox = ambiti;
    }
    );

  }

  ngOnInit() {

    this.authenticationService.user$.subscribe(user => {
      this.userLogged = user;
    });


    this.getListClienti();
  }

  getListClienti(){
    //se non è admin, per essere in amministrazione, può essere solo admin di progetto
    if (!this.userLogged.isAdmin) { //gestione filtro per clienti dell'utente loggato
      var selClientiCriteria = [];

      this.userLogged.clienti.forEach(clientiUser => {
        selClientiCriteria.push(clientiUser.cliente._id);
      });

      this.clientService.getClientiByUser(selClientiCriteria).subscribe(clients =>
        this.clients = clients
      );
    }
    else { //nessun filtro
      this.clientService.getClienti().subscribe(clients =>
        this.clients = clients
      );
    }
  }


  /*Gestione click MODIFICA UTENTE*/
  editRow(rowData, rowIndex) {
    this.selectedAmbitis = [];
    this.newClient = JSON.parse(JSON.stringify(rowData));
    this.newClient.data_inizio_validita = new Date(this.newClient.data_inizio_validita);
    this.newClient.data_fine_validita = this.newClient.data_fine_validita != null ? new Date(this.newClient.data_fine_validita) : null;
    this.newClient.ambiti.forEach(ambito => {
      if (ambito.id_ambito != null) {
        this.selectedAmbitis.push(this.ambitiComboBox.find(x => x.value == ambito.id_ambito).value);
      }
    });
    this.headerCliente = "Modifica Cliente - " + this.newClient.nome_cliente;
    this.clientIndex = rowIndex;
    this.displayDialog = true;
  }

  /*Gestione click AGGIUNTA CLIENTE*/
  addNewClient() {
    this.newClient = new Cliente();
    this.newClient.data_inizio_validita = new Date();
    this.formSubmitted = false;
    this.headerCliente = "Aggiungi Cliente";
    this.clientIndex = null;
    this.displayDialog = true;
    this.clientForm.reset();
    this.selectedAmbitis = [];
  }

  saveNew() {
    this.popolaAmbitiCliente(this.selectedAmbitis);

    this.clientService.addCliente(this.newClient).subscribe(
      cliente => {
        if (this.clientIndex == null)
          this.clients.push(cliente);
        else
          this.clients[this.clientIndex] = cliente;

        //this.changeFormatDate(this.clients);
    });
    this.displayDialog = false;
    this.selectedAmbitis = [];
  }


  //DELETE ROW
  private deleteRow(rowData, rowIndex) {
    var selCriteria;
    var attivitaCount = 0;
    selCriteria = new Object();
    selCriteria.id_cliente = rowData._id;

    this.attivitaService.getAttivitaWithCriteria(selCriteria).subscribe(
      attivita => {
        attivita.forEach(element => {
          if (element.stato_attivita == 'OPEN' || element.stato_attivita == 'CHECK')
            attivitaCount++;
        });

        if (attivitaCount == 0) { //nessun attivita in corso
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
        else {
          this.alertDialog = true;
          this.alertMsg = 'Impossibile eliminare il cliente, presenti attività in corso collegate!';
        }
      }
    )


  }


  //VALIDATOR & UTILITY

  private popolaAmbitiCliente(ambitiSelezionati) {
    ambitiSelezionati.forEach((elem, index) => {
      if (index == 0) {
        this.newClient.ambiti = [{ nome_ambito: this.ambitiComboBox.find(x => x.value == elem).label, id_ambito: elem, data_inizio_validita: null, data_fine_validita: null }];
      } else {
        this.newClient.ambiti.push({ nome_ambito: this.ambitiComboBox.find(x => x.value == elem).label, id_ambito: elem, data_inizio_validita: null, data_fine_validita: null });
      }
    });
  }

  private controlDateValidator(control: FormControl) {
    let dataInizio = control.root.value['dataInizio'] != null ? control.root.value['dataInizio'] : null;
    let dataFine = control.value;
    if (dataInizio > dataFine && dataFine != null) {
      return { controlDate: true }
    }
    return null;
  }


  /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
  public checkForm(form) {
    this.formSubmitted = true;
    return form.valid;
  }


  public isValid(componentName: string) {
    if ((this.clientForm.get(componentName).touched || this.formSubmitted) && this.clientForm.get(componentName).errors)
      return "#a94442";
    else
      return "#898989"; //#d6d6d6
  }

  private isModifica() {
    return this.clientIndex != null;
  }

  public isDisabled(componentName) {
    switch (componentName) {
      case 'ambiti':
        if (this.newClient.nome_cliente == null)
          return true;
        else
          return false;
    }
  }

  public abortNew() {
    this.displayDialog = false;
  }

  private createAmbito() {
    var ambito: any;
    ambito = {};
    ambito.id_ambito = null;
    ambito.nome_ambito = null;
    ambito.data_inizio_validita = new Date();
    ambito.data_fine_validita = null;
    return ambito;
  }

  private changeFormatDate(cliente: Cliente) {
    if (cliente.ambiti != null) {
      cliente.ambiti.forEach(element => {
        element.data_inizio_validita = element.data_inizio_validita != null ? new Date(element.data_inizio_validita) : null;
        element.data_fine_validita = element.data_fine_validita != null ? new Date(element.data_fine_validita) : null;
      });
    }
  }

}



