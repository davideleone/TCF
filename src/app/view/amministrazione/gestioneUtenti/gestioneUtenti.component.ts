import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Injectable, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../model/user';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { UserService } from '../../../service/user.service';
import { DatePipe } from '@angular/common';
import { DomainService } from '../../../service/domain.service';
import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../../service/cliente.service';
import { Cliente } from '../../../model/cliente';

import { ConfirmationService } from 'primeng/primeng';
import { AuthenticationService } from '../../../service/authentication.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'gestioneUtenti',
  templateUrl: './gestioneUtenti.component.html',
  styleUrls: ['./gestioneUtenti.component.css'],
  providers: [FormBuilder, AuthenticationService, UserService, DomainService, ClienteService, ConfirmationService]
})

export class GestioneUtentiComponent implements OnInit {

  readonly ID_CLIENTE_FINCONS: any = '5a4628f3a8e4253d4faadbcb';

  allSistemUser: User[] = [];
  users: any;
  newUser: User;
  sedi: any;
  clientiList: Cliente[] = [];
  admins: SelectItem[] = [{ label: "Si", value: true }, { label: "No", value: false }];
  sediList: SelectItem[] = [];
  clientiComboBox: SelectItem[] = [];
  clientiComboBoxClone: SelectItem[] = [];
  profili: SelectItem[] = [{ label: "Amm. di Progetto", value: "AP" }, { label: "Consuntivatore", value: "CS" }];
  userLogged: User;
  headerUtente: string;
  displayDialog: boolean = false;
  datePipe = new DatePipe('en-US');
  //btnDialog: any;
  startUserDate: string;
  endUserDate: string;
  startClientDate: Date[] = [];
  endClientDate: Date[] = [];
  minClientDate: Date[] = [];
  maxClientDate: Date[] = [];
  userIndex;
  userForm: FormGroup;
  confirmPassword: string;
  formSubmitted: boolean = false;
  clientiObject: any;
  alertDialog: boolean = false;
  alertMsg: string;
  deepCopyClienti;
  disableAggiuntaCliente: boolean = false;
  clienteFincons: Cliente;

  constructor(private userService: UserService,
    private domainService: DomainService,
    private clienteService: ClienteService,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private changeDetectionRef: ChangeDetectorRef) {
    this.authenticationService.user$.subscribe(user => { this.userLogged = user });
    this.allSistemUser = [];
    this.users = [];
    this.sedi = null;
    this.newUser = new User();
    this.clientiObject = new Array<Object>();
    this.userForm = this.formBuilder.group({
      cognome: new FormControl('', Validators.required),
      nome: new FormControl('', Validators.required),
      email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      dataInizio: new FormControl('', Validators.required),
      dataFine: new FormControl('', this.controlDateValidator),
      username: new FormControl('', [Validators.required/*, this.usernameValidator*/]),
      password: new FormControl('', Validators.required),
      confPassword: new FormControl('', Validators.compose([Validators.required, this.matchPasswordValidator])),
      dataInizioCliente: new FormControl('', Validators.required),
      dataFineCliente: new FormControl('', this.controlClientDateValidator),
      sede: new FormControl('', Validators.required),
      idCliente: new FormControl('', Validators.required),
      profiloCliente: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.userService.getUsersByManager(this.userLogged._id).subscribe(users => this.users = users);

    this.domainService.getSedi().subscribe(sedi =>{
       this.sediList = sedi;
       this.ordinaLista(this.sediList);
      });

    this.authenticationService.user$.subscribe(user => {
      this.userLogged = user

      if (!this.userLogged.isAdmin)
        this.getClientiLikeProjectAdmin();
      else
        this.getClientiLikeFullAdmin();
    });

  }

  getClientiLikeFullAdmin() {
    this.clienteService.getClienti().subscribe(clienti => {
      this.clientiList = Object.assign({}, clienti);

      clienti.forEach(cliente => {
        if (cliente._id == this.ID_CLIENTE_FINCONS)
          this.clienteFincons = cliente;
        this.clientiComboBox.push({ label: cliente.nome_cliente, value: cliente._id });
        this.minClientDate.push(cliente.data_inizio_validita);
        this.maxClientDate.push(cliente.data_fine_validita);
      });
    });
  }

  getClientiLikeProjectAdmin() {
    var selClientiCriteria = []

    this.userLogged.clienti.forEach(clientiUser => {
      selClientiCriteria.push(clientiUser.cliente._id);
    });

    this.clienteService.getClientiByUser(selClientiCriteria).subscribe(clienti => {
      this.clientiList = Object.assign({}, clienti);
      clienti.forEach(cliente => {
        if (cliente._id == this.ID_CLIENTE_FINCONS)
          this.clienteFincons = cliente;
        this.clientiComboBox.push({ label: cliente.nome_cliente, value: cliente._id });
        this.minClientDate.push(cliente.data_inizio_validita);
        this.maxClientDate.push(cliente.data_fine_validita);
      });
    });
  }

  /*Gestione click MODIFICA UTENTE*/
  editUser(rowData, rowIndex) {
    this.abilitaValidazioni();
    this.disableAggiuntaCliente = false;

    this.newUser = JSON.parse(JSON.stringify(rowData));
    this.newUser.data_inizio_validita = new Date(this.newUser.data_inizio_validita);
    this.newUser.data_fine_validita = this.newUser.data_fine_validita != null ? new Date(this.newUser.data_fine_validita) : null;

    this.clientiObject = [];
    if (this.newUser.clienti != null && Object.keys(this.newUser.clienti).length > 0) {
      this.newUser.clienti.forEach((element: any, index) => {
        if (element != null) {
          element.data_inizio_validita_cliente = element.data_inizio_validita_cliente != null ? new Date(element.data_inizio_validita_cliente) : null;
          element.data_fine_validita_cliente = element.data_fine_validita_cliente != null ? new Date(element.data_fine_validita_cliente) : null;
        }

        if (element.cliente != undefined && element.cliente._id != null) {
          element.isEditable = false;
          this.clientiObject.push(element)
        }
      });
    }

    this.headerUtente = "Modifica Utente - " + this.newUser.nome + " " + this.newUser.cognome;
    this.userIndex = rowIndex;
    this.displayDialog = true;
  }

  /*Gestione click AGGIUNTA UTENTE*/
  addNewUser() {
    var newclienteFincons: any;
    newclienteFincons = {};
    newclienteFincons.cliente = this.clienteFincons;
    newclienteFincons.profilo = this.profili.find(x => x.value == 'CS').value;
    newclienteFincons.data_inizio_validita_cliente = new Date();
    newclienteFincons.data_fine_validita_cliente = null;
    newclienteFincons.isEditable = false;

    this.clientiObject = [];
    this.clientiObject.push(newclienteFincons);

    this.disableAggiuntaCliente = false;
    this.abilitaValidazioni();
    this.newUser = new User();
    this.newUser.clienti = this.clientiObject;
    this.newUser.isAdmin = false;
    this.newUser.data_inizio_validita = new Date();
    this.formSubmitted = false;
    this.headerUtente = "Aggiungi Utente";
    this.userIndex = null;
    this.displayDialog = true;
    this.userForm.reset();
  }

  saveNew() {

    var userTrovatoIndex = this.users.findIndex(i => i._id == this.newUser._id && this.newUser._id != undefined);
    this.newUser.desc_sede = this.sediList.find(i => i.value == this.newUser.id_sede).label;
    this.userService.insOrUpdUser(this.newUser).subscribe(
      user => {
        if (userTrovatoIndex == -1) { //aggiunta
          if (this.users != null)
            this.users.push(user);
          else
            this.users = this.newUser;
        } else {
          this.users[userTrovatoIndex] = user;
        }
        this.CloseAllEditable();
        this.disableAggiuntaCliente = false;
        this.displayDialog = false;
        this.users = JSON.parse(JSON.stringify(this.users)); //deepcopy
        this.changeFormatDate(this.users);
      },
      error => {
        this.alertDialog = true;
        this.alertMsg = error;
      });
  }

  /*Metodo per aggiungere, al click del bottone, una riga alla table dei clienti*/
  addCliente() {
    this.abilitaValidazioni();
    this.CloseAllEditable();
    var newCliente: any;
    newCliente = {};
    newCliente.cliente = {};
    newCliente.cliente._id = null;
    newCliente.profilo = null;
    newCliente.data_inizio_validita_cliente = new Date();
    newCliente.data_fine_validita_cliente = null;
    newCliente.isEditable = true;

    this.clientiObject.push(newCliente);
    this.disableAggiuntaCliente = true;
    this.clientiComboBoxClone = [];
    this.filtraClientiCombo(null);
  }

  //DELETE ROW
  private deleteRow(rowData, rowIndex) {
    var userTrovatoIndex = this.users.findIndex(i => i._id == rowData._id);
    var selCriteria;
    selCriteria = new Object();
    selCriteria._id = rowData._id;
    this.confirmationService.confirm({
      message: "Sei sicuro di voler eliminare l'utente '" + rowData.nome + " " + rowData.cognome + "' ?",
      header: 'Elimina utente',
      icon: 'fa fa-trash',
      accept: () => {
        this.userService.deleteUser(selCriteria).subscribe(event => {
          this.users.splice(userTrovatoIndex, 1);
          this.users = JSON.parse(JSON.stringify(this.users)); //deepcopy
          this.changeFormatDate(this.users);
        });
      }
    });
  }

  private deleteClientRow(rowData, rowIndex) {
    this.confirmationService.confirm({
      message: "Sei sicuro di voler eliminare il cliente?",
      header: 'Elimina cliente',
      icon: 'fa fa-trash',
      accept: () => {
        this.clientiObject.splice(rowIndex, 1);
        this.newUser.clienti.splice(rowIndex, 1);
        this.disabilitaValidazioni();
      }
    });
  }


  //VALIDATOR & UTILITY

  /*Funzione per modificare il formato della data ritornato dallo stringify(da ISO8061 a new Date)
  per la non compatibilità col calendar*/
  private changeFormatDate(user: User) {
    if (user.clienti != null) {
      user.clienti.forEach(element => {
        element.data_inizio_validita_cliente = element.data_inizio_validita_cliente != null ? new Date(element.data_inizio_validita_cliente) : null;
        element.data_fine_validita_cliente = element.data_fine_validita_cliente != null ? new Date(element.data_fine_validita_cliente) : null;
      });
    }
  }

  private matchPasswordValidator(control: FormControl) {
    let password = control.root.value['password'] != null ? control.root.value['password'] : null;
    let confPassword = control.value;
    if (password != confPassword) {
      return { matchPassword: true }
    }
    return null;
  }

  private controlDateValidator(control: FormControl) {
    let dataInizio = control.root.value['dataInizio'] != null ? control.root.value['dataInizio'] : null;
    let dataFine = control.value;
    if (dataInizio > dataFine && dataFine != null) {
      return { controlDate: true }
    }
    return null;
  }

  private controlClientDateValidator(control: FormControl) {
    let dataInizioCliente = control.root.value['dataInizioCliente'] != null ? control.root.value['dataInizioCliente'] : null;
    let dataFineCliente = control.value;
    if (dataInizioCliente > dataFineCliente && dataFineCliente != null) {
      return { controlClientDate: true }
    }
    return null;
  }

  /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
  public checkForm(form) {
    //disabilito controlli in caso di modifica utente (psw non visibili)
    if (this.userIndex != null) {
      this.disabilitaValidazioni();
    }
    //disabilito controlli in caso di nessun cliente inserito (posso inserire utente senza clienti)
    if (this.newUser.clienti == null || (this.newUser.clienti != null && !(this.newUser.clienti.length > 1))) {
      this.userForm.controls['idCliente'].disable();
      this.userForm.controls['profiloCliente'].disable();
      this.userForm.controls['dataInizioCliente'].disable();
      this.userForm.controls['dataFineCliente'].disable();
    }
    this.formSubmitted = true;

    console.log(form)
    if (!form.valid) {
      this.alertDialog = true;
      this.alertMsg = "Alcuni campi non stati compilati correttamente!";
    }
    return form.valid;
  }

  private abilitaValidazioni() {
    this.userForm.controls['password'].enable();
    this.userForm.controls['confPassword'].enable();
    this.userForm.controls['idCliente'].enable();
    this.userForm.controls['profiloCliente'].enable();
    this.userForm.controls['dataInizioCliente'].enable();
    this.userForm.controls['dataFineCliente'].enable();
  }

  private disabilitaValidazioni() {
    this.userForm.controls['password'].disable();
    this.userForm.controls['confPassword'].disable();
    this.userForm.controls['idCliente'].disable();
    this.userForm.controls['profiloCliente'].disable();
    this.userForm.controls['dataInizioCliente'].disable();
    this.userForm.controls['dataFineCliente'].disable();
  }

  public isValid(componentName: string) {
    if ((this.userForm.get(componentName).touched || this.formSubmitted) && this.userForm.get(componentName).errors)
      return "#a94442";
    else
      return "#898989"; //#d6d6d6
  }

  private isModifica() {
    return this.userIndex != null;
  }

  private editCliente(rowData, indexData) {
    this.clientiComboBoxClone = [];
    this.filtraClientiCombo({ label: rowData.cliente.nome_cliente, value: rowData.cliente._id });
    this.disableAggiuntaCliente = true;
    this.CloseAllEditable();
    rowData.isEditable = true;
    this.deepCopyClienti = JSON.parse(JSON.stringify(this.newUser.clienti));
  }

  private CloseAllEditable() {
    for (let item of this.clientiObject)
      if (item.isEditable)
        item.isEditable = false;
  }

  private abortEditCliente(rowData, indexData) {
    //this.clientiComboBoxClone = [];

    if (this.checkClienteRow(rowData))
      return;

    if (rowData.cliente._id == null) {
      this.clientiObject.splice(indexData, 1);
      rowData.isEditable = false;
    }
    else {
      rowData.isEditable = false;
    }

    this.disableAggiuntaCliente = false;
  }

  private saveEditCliente(rowData, indexData) {
    var clienteTrovato;

    if (this.checkClienteRow(rowData))
      return;



    /*Prendo solo la porziona di array senza l'ultimo elemento. Quest'ultimo infatti contiene
    il cliente che sto inserendo, andando quindi ad influenzare la find poichè troverebbe sicuramente almeno un elemento*/
    if (this.newUser.clienti != null && this.newUser.clienti.length > 0)
      clienteTrovato = this.newUser.clienti.slice(0, this.newUser.clienti.length - 1).find(x => x.cliente._id == rowData.cliente._id)

    if (clienteTrovato == null) {
      var newCliente: any = {};

      if (this.newUser.clienti != null) {
        this.newUser.clienti[indexData] = {
          cliente: this.getClienteInList(rowData.cliente._id),
          profilo: rowData.profilo,
          data_inizio_validita_cliente: rowData.data_inizio_validita_cliente != null ? new Date(rowData.data_inizio_validita_cliente) : new Date(),
          data_fine_validita_cliente: rowData.data_fine_validita_cliente
        };
      }
      else {
        this.popolaCliente(rowData, newCliente);
        this.newUser.clienti = [{
          cliente: this.getClienteInList(rowData.cliente._id),
          profilo: newCliente.profilo,
          data_inizio_validita_cliente: newCliente.data_inizio_validita_cliente != null ? new Date(newCliente.data_inizio_validita_cliente) : new Date(),
          data_fine_validita_cliente: newCliente.data_fine_validita_cliente
        }]
      }

      this.clientiObject = this.newUser.clienti;

    }
    else {
      if (rowData._id) {
        this.newUser.clienti[indexData] = {
          cliente: this.getClienteInList(rowData.cliente._id),
          profilo: rowData.profilo,
          data_inizio_validita_cliente: rowData.data_inizio_validita_cliente != null ? new Date(rowData.data_inizio_validita_cliente) : new Date(),
          data_fine_validita_cliente: rowData.data_fine_validita_cliente
        }
        this.clientiObject = this.newUser.clienti;
      }
    }

    rowData.isEditable = false;
    this.clientiComboBoxClone = [];
    this.disableAggiuntaCliente = false;
  }

  getClienteInList(id) {
    for (let i = 0; i < Object.keys(this.clientiList).length; i++) {
      if (this.clientiList[i]._id == id)
        return this.clientiList[i];
    }
  }

  public abortNew() {
    this.displayDialog = false;
  }

  private filtraClientiCombo(editedObject) {
    var clienteTrovato;
    if (editedObject != null) {
      this.clientiComboBoxClone.push(editedObject);
    }
    this.clientiComboBox.forEach(elements => {
      if (this.newUser.clienti != null)
        clienteTrovato = this.newUser.clienti.find(x => x.cliente._id == elements.value)
      if (clienteTrovato == null)
        this.clientiComboBoxClone.push(elements);
      clienteTrovato = null;
    });

  }

  private popolaCliente(clienteSource, clienteTarget) {
    //clienteTarget.cliente = this.clientiList.filter(cliente => cliente._id == clienteSource.cliente._id)[0];

    for (let i = 0; i < this.clientiList.length; i++) {
      if (this.clientiList[i]._id == clienteSource.cliente._id) {
        clienteTarget.cliente = this.clientiList[i]
        clienteTarget._id = this.clientiList[i]._id
      }
    }
    clienteTarget.profilo = clienteSource.profilo;
    clienteTarget.data_inizio_validita_cliente = clienteSource.data_inizio_validita_cliente;
    clienteTarget.data_fine_validita_cliente = clienteSource.data_fine_validita_cliente;
  }

  private findInvalidControls() {
    var invalid = [];
    var controls = this.userForm.controls;
    for (let name in controls) {
      if (controls[name].invalid) {
        name = name.charAt(0).toUpperCase() + name.substring(1);
        invalid.push(name);
      }
    }
    return invalid;
  }

  checkClienteRow(rowData) {
    var error = false;
    if (rowData.cliente._id == null) {
      this.alertDialog = true;
      this.alertMsg = "Nessun cliente selezionato!";
      error = true;
    }

    if (!rowData.profilo) {
      this.alertDialog = true;
      this.alertMsg = "Profilo per il cliente obbligatorio";
      error = true;
    }

    if (!rowData.data_inizio_validita_cliente) {
      this.alertDialog = true;
      this.alertMsg = "Data inizio validita obbligatoria";
      error = true;
    }

    if (rowData.data_fine_validita_cliente != null) {
      if (new Date(rowData.data_inizio_validita_cliente) > new Date(rowData.data_fine_validita_cliente)) {
        this.alertDialog = true;
        this.alertMsg = "Data inizio e fine validita incongruenti";
        error = true;
      }
    }

    return error;
  }

  ordinaLista(listName : SelectItem[]){
    listName.sort((a, b) => {
      if (a.label < b.label) return -1;
      else if (a.label > b.label) return 1;
      else return 0;
    });
  }
}





