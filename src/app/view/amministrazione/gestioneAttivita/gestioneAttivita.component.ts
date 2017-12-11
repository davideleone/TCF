import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Injectable, ViewEncapsulation } from '@angular/core';

import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../../service/cliente.service';
import { Cliente } from '../../../model/cliente';
import { ConfirmationService, DataTable } from 'primeng/primeng';
import { AuthenticationService } from '../../../service/authentication.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Attivita } from '../../../model/attivita';
import { DomainService } from '../../../service/domain.service';
import { CommessaCliente } from '../../../model/commessaCliente';
import { Domain } from '../../../model/domain';
import { CommessaClienteService } from '../../../service/commessaCliente.service';
import { AttivitaService } from '../../../service/attivita.service';

@Component({
    selector: 'gestioneAttivita',
    templateUrl: './gestioneAttivita.component.html',
    styleUrls: ['./gestioneAttivita.component.css'],
    providers: [DomainService, CommessaClienteService, FormBuilder, AuthenticationService, ClienteService, ConfirmationService],
    // encapsulation: ViewEncapsulation.None
})

export class GestioneAttivitaComponent implements OnInit {
    
    commesse: CommessaCliente[];
    activityClone: Attivita;
    activities: Attivita[];
    newActivity: Attivita;
    commessaCliente: CommessaCliente[];
    headerAttivita: string;
    //btnDialog: string;
    activityIndex: any;
    displayDialog: boolean;
    activityForm: FormGroup;
    formSubmitted: boolean = false;
    clienti: Cliente[];
    lst_clienti: SelectItem[] = [];
    ambiti: SelectItem[]; //TODO: full list to avoid other call. sostituire con hide/show degli elementi tramite css
    lst_ambiti: SelectItem[] = [];
    lst_macro_aree: SelectItem[] = [];
    lst_commesse_clienti: SelectItem[] = [];
    lst_stati: SelectItem[] = [{ label: 'Aperto', value: 'OPEN' }, { label: 'In Verifica', value: 'CHECK' }, { label: 'Chiuso', value: 'CLOSE' }];

    constructor(private formBuilder: FormBuilder,
        private clienteService: ClienteService,
        private domainService: DomainService,
        private confirmationService: ConfirmationService,
        private commessaClienteService: CommessaClienteService,
        private attivitaService: AttivitaService) {

        this.newActivity = new Attivita();
        this.activities = new Array<Attivita>();

        this.activityForm = this.formBuilder.group({
            cliente: new FormControl('', Validators.required),
            ambito: new FormControl('', Validators.required),
            macro_area: new FormControl('', Validators.required),
            nome_attivita: new FormControl('', Validators.required),
            commessa_cliente: new FormControl('', Validators.required),
            cod_attivita: new FormControl('', Validators.required),
            stato: new FormControl('', Validators.required),
            data_inizio: new FormControl('', Validators.required),
            data_fine: new FormControl('', this.controlDateValidator),
        });
    }

    ngOnInit() {
        this.getInformations();
    }

    getInformations() {
        this.attivitaService.getAttivita().subscribe(attivita => {
            this.activities = attivita;
        });

        this.clienteService.getClienti().subscribe(clienti => {
            this.clienti = clienti;
            clienti.forEach(clienti => {
                this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
            });
        });

        this.domainService.getAree().subscribe(aree => {
            this.lst_macro_aree = aree;
          });

        this.domainService.getAmbiti().subscribe(ambiti => {
            this.ambiti = ambiti;
        });
        this.commessaClienteService.getCommesse().subscribe(commesse => {
            this.commesse = commesse;
        });
    }

    addNewActivity() {
        this.newActivity = new Attivita();
        this.formSubmitted = false;
        this.headerAttivita = "Aggiungi Attivita";
        //this.btnDialog = "Aggiungi";
        this.activityIndex = null;
        this.displayDialog = true;
        this.activityForm.reset();
        this.newActivity.data_inizio_validita = new Date();
        this.newActivity.stato_attivita = "OPEN";
    }

    /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
    private checkForm(form) {
        this.formSubmitted = true;
        return form.valid;
    }

    saveNew() {
        this.newActivity.nome_cliente = this.lst_clienti.find(x => x.value == this.newActivity.id_cliente).label;
        this.newActivity.nome_ambito = this.lst_ambiti.find(x => x.value == this.newActivity.id_ambito).label;
        this.newActivity.nome_macro_area = this.lst_macro_aree.find(x => x.value == this.newActivity.id_macro_area).label;
        this.newActivity.nome_commessa_cliente = this.lst_commesse_clienti.find(x => x.value == this.newActivity.id_commessa_cliente).label;
        this.newActivity.nome_stato = this.lst_stati.find(x => x.value == this.newActivity.stato_attivita).label;
        
        if(this.newActivity.budget_euro==null)
            this.newActivity.budget_euro = 0;
        if(this.newActivity.budget_gg==null)
            this.newActivity.budget_gg = 0;

        if (this.activityIndex == null) { //aggiunta
            this.attivitaService.addAttivita(this.newActivity).subscribe(event => {
                this.activities.push(this.newActivity);
                this.activities = JSON.parse(JSON.stringify(this.activities)); //deepcopy
                this.changeFormatDate(this.activities);
            });
        }
        else { //modifica
            var selCriteria;
            selCriteria = new Object();
            selCriteria.codice_attivita = this.newActivity.codice_attivita;
            this.attivitaService.updateAttivita(this.newActivity, selCriteria).subscribe(event => {
                this.activities[this.activityIndex] = this.newActivity;
                this.activities = JSON.parse(JSON.stringify(this.activities)); //deepcopy
                this.changeFormatDate(this.activities);
            });
        }
        this.displayDialog = false;
    }

    private selectFromCliente(componentName, isEdit) {
        var selCriteria;
        selCriteria = new Object();
        selCriteria.id_cliente = this.newActivity.id_cliente;
        switch (componentName) {
            case 'ambito':
                if (!isEdit) {
                    this.activityForm.reset();
                    this.resetActivity(this.newActivity);
                    this.newActivity.id_cliente = selCriteria.id_cliente;
                }
                this.lst_ambiti = [];
                let ambitiCliente: any[] = this.clienti.find(x => x._id == this.newActivity.id_cliente).ambiti;
                
                this.ambiti.forEach(ambito => {
                    let elem: SelectItem = ambitiCliente.find(x=> x.id_ambito == ambito.value); 
                    if (elem != null)
                        this.lst_ambiti.push({ label: ambito.label, value: ambito.value })
                });
                this.newActivity.stato_attivita = "OPEN";
                this.newActivity.nome_stato = "Aperto";
                break;
            case 'commessa_cliente':
                this.lst_commesse_clienti = [];
                this.commesse.forEach(element => {
                    if (element.id_cliente == selCriteria.id_cliente)
                        this.lst_commesse_clienti.push({ label: element.nome_commessa, value: element._id })
                });
                break;
        }
    }

    private deleteRow(rowData, rowIndex) {
        var selCriteria;
        selCriteria = new Object();
        selCriteria.codice_attivita = rowData.codice_attivita;
        this.confirmationService.confirm({
            message: "Sei sicuro di voler eliminare l'attività '" + rowData.nome_attivita + "' ?",
            header: 'Elimina attività',
            icon: 'fa fa-trash',
            accept: () => {
                this.attivitaService.deleteAttivita(selCriteria).subscribe(event => {
                    this.activities.splice(rowIndex, 1);
                    this.activities = JSON.parse(JSON.stringify(this.activities)); //deepcopy
                    this.changeFormatDate(this.activities);
                });
            }
        });
    }


    private editRow(rowData, rowIndex) {
        this.newActivity = JSON.parse(JSON.stringify(rowData));
        //this.changeFormatDate(this.newActivity);
        this.selectFromCliente('ambito', true);
        this.selectFromCliente('commessa_cliente', true);

        this.newActivity.data_inizio_validita = new Date(rowData.data_inizio_validita);
        this.newActivity.data_fine_validita = rowData.data_fine_validita != null ? new Date(rowData.data_fine_validita) : null;
        this.headerAttivita = "Modifica attività - " + this.newActivity.nome_attivita;
        //this.btnDialog = "Modifica";
        this.activityIndex = rowIndex;
        this.displayDialog = true;
        this.formSubmitted = false;
    }

    private changeFormatDate(activities: Attivita[]) {
        activities.forEach(activity => {
            if (activity != null) {
                activity.data_inizio_validita = activity.data_inizio_validita != null ? new Date(activity.data_inizio_validita) : null;
                activity.data_fine_validita = activity.data_fine_validita != null ? new Date(activity.data_fine_validita) : null;
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

    private isDisabled(componentName): boolean {
        var disabled = false;

        switch (componentName) {
            case 'ambito': disabled = this.newActivity.id_cliente == null;
                break;
            case 'macroArea': disabled = this.newActivity.id_cliente == null;
                break;
            case 'commessaCliente': disabled = this.newActivity.id_cliente == null || this.newActivity.id_macro_area == null;
                break;
        }

        return disabled;
    }

//TODO da gestire esternamente con CSS!!
    private isValid(componentName: string) {
        if ((this.activityForm.get(componentName).touched || this.formSubmitted) && this.activityForm.get(componentName).errors)
            return "#a94442";
        else
            return "#898989"; //#d6d6d6
    }

    private resetActivity(attivita: Attivita) {
        attivita.id_ambito = null;
        attivita.nome_ambito = null;
        attivita.id_commessa_cliente = null;
        attivita.nome_commessa_cliente = null;
        attivita.id_macro_area = null;
        attivita.nome_macro_area = null;
        attivita.data_inizio_validita = new Date();
        attivita.data_fine_validita = null;
        attivita.stato_attivita = this.lst_stati[0].value;
        attivita.nome_stato = this.lst_stati[0].label;
        attivita.budget_gg = null;
        attivita.budget_euro = null;
    }

    reset(dt: DataTable){
        dt.reset();
    }

    private abortNew() {
        this.displayDialog = false;
      }
}