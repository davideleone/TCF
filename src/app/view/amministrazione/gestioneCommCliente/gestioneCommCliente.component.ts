import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Injectable, ViewEncapsulation } from '@angular/core';

import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../../service/cliente.service';
import { Cliente } from '../../../model/cliente';
import { ConfirmationService, DataTable } from 'primeng/primeng';
import { AuthenticationService } from '../../../service/authentication.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CommessaCliente } from '../../../model/commessaCliente';
import { CommessaClienteService } from '../../../service/commessaCliente.service';
import { CommessaFinconsService } from '../../../service/commessaFincons.service';
import { AttivitaService } from '../../../service/attivita.service';
import { User } from '../../../model/user';

@Component({
    selector: 'gestioneCommessaCliente',
    templateUrl: './gestioneCommCliente.component.html',
    styleUrls: ['./gestioneCommCliente.component.css'],
    providers: [AttivitaService, CommessaClienteService, CommessaFinconsService, FormBuilder, AuthenticationService, ClienteService, ConfirmationService],
    // encapsulation: ViewEncapsulation.None
})

export class GestioneCommClienteComponent implements OnInit {

    userLogged: User;
    CommCliClone: CommessaCliente;
    commClientes: CommessaCliente[];
    newCommCli: CommessaCliente;
    commessaCliente: CommessaCliente[];
    headerCommCliente: string;
    CommCliIndex: any;
    displayDialog: boolean;
    CommCliForm: FormGroup;
    formSubmitted: boolean = false;
    clienti: Cliente[];
    lst_clienti: SelectItem[] = [];
    commesseFnc: SelectItem[]; //TODO: full list to avoid other call. sostituire con hide/show degli elementi tramite css
    lst_commesse_fnc: SelectItem[] = [];
    alertDialog: boolean = false;
    alertMsg: string;

    constructor(private formBuilder: FormBuilder,
        private clienteService: ClienteService,
        private confirmationService: ConfirmationService,
        private commessaClienteService: CommessaClienteService,
        private commessaFinconsService: CommessaFinconsService,
        private attivitaService: AttivitaService,
        private authenticationService: AuthenticationService
    ) {

        this.newCommCli = new CommessaCliente();
        this.commClientes = new Array<CommessaCliente>();

        this.CommCliForm = this.formBuilder.group({
            cliente: new FormControl('', Validators.required),
            nome_commCliente: new FormControl('', Validators.required),
            cod_commCliente: new FormControl('', Validators.required),
            ddl_commesse_fnc: new FormControl('', Validators.required),
            data_inizio: new FormControl('', Validators.required),
            data_fine: new FormControl('', this.controlDateValidator),
        });
    }

    ngOnInit() {
        this.getInformations();
    }

    getInformations() {

        this.authenticationService.user$.subscribe(user => {
            this.userLogged = user;
        });


        //se non è admin, per essere in amministrazione, può essere solo admin di progetto
        if (!this.userLogged.isAdmin) { //gestione filtro per clienti dell'utente loggato

            var selClientiCriteria = [];

            this.userLogged.clienti.forEach(clientiUser => {
                selClientiCriteria.push(clientiUser.cliente._id);
            });

            this.clienteService.getClientiByUser(selClientiCriteria).subscribe(clientiAll => {
                this.clienti = clientiAll;
                clientiAll.forEach(clienti => {
                    this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
                });
            });

            this.commessaClienteService.getCommessaClienteByUser(selClientiCriteria).subscribe(commesse => {
                this.commClientes = commesse;
            });
        }
        else { //nessun filtro
            this.clienteService.getClienti().subscribe(clientiAll => {
                this.clienti = clientiAll;
                clientiAll.forEach(clienti => {
                    this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
                });
            });

            this.commessaClienteService.getCommesse().subscribe(commesse => {
                this.commClientes = commesse;
            });
        }


        this.commessaFinconsService.getCommesse().subscribe(commesse => {
            this.commesseFnc = commesse;
            commesse.forEach(commessa => {
                this.lst_commesse_fnc.push({ label: commessa.nome_commessa, value: commessa._id });
            });
        });

    }

    addNewCommCli() {
        this.newCommCli = new CommessaCliente();
        this.formSubmitted = false;
        this.headerCommCliente = "Aggiungi Commessa Cliente";
        //this.btnDialog = "Aggiungi";
        this.CommCliIndex = null;
        this.displayDialog = true;
        this.CommCliForm.reset();
        this.newCommCli.data_inizio_validita = new Date();

    }

    /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
    public checkForm(form) {
        this.formSubmitted = true;
        return form.valid;
    }

    saveNew() {
        var commClienteTrovatoIndex = this.commClientes.findIndex(i => i._id == this.newCommCli._id && this.newCommCli._id != undefined);
        this.newCommCli.nome_cliente = this.lst_clienti.find(x => x.value == this.newCommCli.id_cliente).label;
        this.newCommCli.nome_commessa_fnc = this.lst_commesse_fnc.find(x => x.value == this.newCommCli.id_commessa_fnc).label;

        if (this.newCommCli.budget_euro == null)
            this.newCommCli.budget_euro = 0;
        if (this.newCommCli.budget_gg == null)
            this.newCommCli.budget_gg = 0;

        if (commClienteTrovatoIndex == -1) { //aggiunta
            this.commessaClienteService.addCommessaCliente(this.newCommCli).subscribe(event => {
                this.commClientes.push(this.newCommCli);
                this.commClientes = JSON.parse(JSON.stringify(this.commClientes)); //deepcopy
                this.changeFormatDate(this.commClientes);
            });
        }
        else { //modifica
            var selCriteria;
            selCriteria = new Object();
            selCriteria._id = this.newCommCli._id;
            this.commessaClienteService.updateCommessaCliente(this.newCommCli, selCriteria).subscribe(event => {
                this.commClientes[commClienteTrovatoIndex] = this.newCommCli;
                this.commClientes = JSON.parse(JSON.stringify(this.commClientes)); //deepcopy
                this.changeFormatDate(this.commClientes);
            });
        }
        this.displayDialog = false;
    }

    private deleteRow(rowData, rowIndex) {
        var commClienteTrovatoIndex = this.commClientes.findIndex(i => i._id == rowData._id);
        
        var selCriteria, attivitaCount = 0;
        selCriteria = new Object();
        //selCriteria.codice_commCliente = rowData.codice_commCliente;
        selCriteria.id_commessa_cliente = rowData._id;
        this.attivitaService.getAttivitaWithCriteria(selCriteria).subscribe(
            attivita => {
                attivita.forEach(element => {
                    if (element.stato_attivita == 'OPEN' || element.stato_attivita == 'CHECK')
                        attivitaCount++;
                });

                if (attivitaCount == 0) { //nessuna attivita collegata
                    selCriteria = new Object();
                    selCriteria.codice_commessa = rowData.codice_commessa;
                    this.confirmationService.confirm({
                        message: "Sei sicuro di voler eliminare la commessa '" + rowData.nome_commessa + "' ?",
                        header: 'Elimina Commessa Cliente',
                        icon: 'fa fa-trash',
                        accept: () => {
                            this.commessaClienteService.deleteCommessaCliente(selCriteria).subscribe(event => {
                                this.commClientes.splice(commClienteTrovatoIndex, 1);
                                this.commClientes = JSON.parse(JSON.stringify(this.commClientes)); //deepcopy
                                this.changeFormatDate(this.commClientes);
                            });
                        }
                    });
                }
                else {
                    this.alertDialog = true;
                    this.alertMsg = "Impossibile eliminare la commessa, presenti attivita' collegate!";
                }
            }


        )


    }


    private editRow(rowData, rowIndex) {
        this.newCommCli = JSON.parse(JSON.stringify(rowData));
        //this.changeFormatDate(this.newCommCli);
        this.newCommCli.data_inizio_validita = new Date(rowData.data_inizio_validita);
        this.newCommCli.data_fine_validita = rowData.data_fine_validita != null ? new Date(rowData.data_fine_validita) : null;
        this.headerCommCliente = "Modifica Commessa - " + this.newCommCli.nome_commessa;
        //this.btnDialog = "Modifica";
        this.CommCliIndex = rowIndex;
        this.displayDialog = true;
        this.formSubmitted = false;
    }

    private changeFormatDate(commClientes: CommessaCliente[]) {
        commClientes.forEach(CommCli => {
            if (CommCli != null) {
                CommCli.data_inizio_validita = CommCli.data_inizio_validita != null ? new Date(CommCli.data_inizio_validita) : null;
                CommCli.data_fine_validita = CommCli.data_fine_validita != null ? new Date(CommCli.data_fine_validita) : null;
            }
        });
    }

    private controlDateValidator(control: FormControl) {
        let dataInizio = control.root.value['data_inizio'] != null ? control.root.value['data_inizio'] : null;
        let dataFine = control.value;
        if (dataInizio > dataFine && dataFine != null) {
            return { controlDate: true }
        }
        return null;
    }

    public isDisabled(componentName): boolean {
        var disabled = false;

        switch (componentName) {
            case 'ambito': disabled = this.newCommCli.id_cliente == null;
                break;
            case 'macroArea': disabled = this.newCommCli.id_cliente == null;
                break;
        }

        return disabled;
    }

    //TODO da gestire esternamente con CSS!!
    public isValid(componentName: string) {
        if ((this.CommCliForm.get(componentName).touched || this.formSubmitted) && this.CommCliForm.get(componentName).errors)
            return "#a94442";
        else
            return "#898989"; //#d6d6d6
    }

    private resetCommCli(commCliente: CommessaCliente) {
        commCliente.budget_euro = null;
        commCliente.budget_gg = null;
        commCliente.codice_offerta = null;
        commCliente.codice_ordine = null;
        commCliente.data_fine_validita = null;
        commCliente.data_inizio_validita = new Date();
        commCliente.data_fine_validita = null;
        commCliente.id_cliente = null;
        commCliente.nome_cliente = null;
        commCliente.id_commessa_fnc = null;
        commCliente.nome_commessa_fnc = null;
        commCliente.codice_commessa = null;
        commCliente.nome_commessa = null;
    }

    reset(dt: DataTable) {
        dt.reset();
    }

    public abortNew() {
        this.displayDialog = false;
    }
}