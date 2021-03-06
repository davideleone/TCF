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
import { ConsuntivazioneService } from '../../../service/consuntivazione.service';
import { User } from '../../../model/user';

@Component({
    selector: 'gestioneAttivita',
    templateUrl: './gestioneAttivita.component.html',
    styleUrls: ['./gestioneAttivita.component.css'],
    providers: [ConsuntivazioneService, DomainService, CommessaClienteService, FormBuilder, AuthenticationService, ClienteService, ConfirmationService],
    // encapsulation: ViewEncapsulation.None
})

export class GestioneAttivitaComponent implements OnInit {

    userLogged: User;
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
    alertDialog: boolean = false;
    alertMsg: string;

    constructor(private formBuilder: FormBuilder,
        private clienteService: ClienteService,
        private domainService: DomainService,
        private confirmationService: ConfirmationService,
        private commessaClienteService: CommessaClienteService,
        private attivitaService: AttivitaService,
        private consuntivazioneSerice: ConsuntivazioneService,
        private authenticationService: AuthenticationService) {



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

        this.authenticationService.user$.subscribe(user => {
            this.userLogged = user;
        });
        //se non è admin, per essere in amministrazione, può essere solo admin di progetto
        if (!this.userLogged.isAdmin) { //gestione filtro per clienti dell'utente loggato
            var selClientiCriteria = []

            this.userLogged.clienti.forEach(clientiUser => {
                if(clientiUser.profilo == 'AP')
                    selClientiCriteria.push(clientiUser.cliente._id);
            });

            this.clienteService.getClientiByUser(selClientiCriteria).subscribe(clientiAll => {
                this.clienti = clientiAll;
                clientiAll.forEach(clienti => {
                    this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
                });
            });

            this.activities = [];
            this.attivitaService.getAttivita().subscribe(attivita => {
                var clientArray = [];
                attivita.forEach((element,index) => {
                    selClientiCriteria.forEach(userClienti =>{
                        if(userClienti == element.id_cliente){
                            clientArray.push(element);
                        }
                    })
                }); 
                this.activities = clientArray;               
            });

            
        }
        else {//nessun filtro
            this.clienteService.getClienti().subscribe(clientiAll => {
                this.clienti = clientiAll;
                clientiAll.forEach(clienti => {
                    this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
                });
            });

            this.attivitaService.getAttivita().subscribe(attivita => {
                this.activities = attivita;
            });
        }

        this.domainService.getAree().subscribe(aree => {
            this.lst_macro_aree = aree;
            this.ordinaLista(this.lst_macro_aree);
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
        this.newActivity.nome_stato = "Aperto";
    }

    /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
    public checkForm(form) {
        this.formSubmitted = true;
        return form.valid;
    }

    saveNew() {
        var attivitaTrovataIndex = this.activities.findIndex(i => i._id == this.newActivity._id && this.newActivity._id != undefined);
        
        this.newActivity.nome_cliente = this.lst_clienti.find(x => x.value == this.newActivity.id_cliente).label;
        this.newActivity.nome_ambito = this.lst_ambiti.find(x => x.value == this.newActivity.id_ambito).label;
        this.newActivity.nome_macro_area = this.lst_macro_aree.find(x => x.value == this.newActivity.id_macro_area).label;
        this.newActivity.nome_commessa_cliente = this.lst_commesse_clienti.find(x => x.value == this.newActivity.id_commessa_cliente).label;
        this.newActivity.nome_stato = this.lst_stati.find(x => x.value == this.newActivity.stato_attivita).label;

        if (this.newActivity.budget_euro == null)
            this.newActivity.budget_euro = 0;
        if (this.newActivity.budget_ore == null)
            this.newActivity.budget_ore = 0;

        /*if (attivitaTrovataIndex == -1) { //aggiunta
            this.attivitaService.addAttivita(this.newActivity).subscribe(
            activity => {
                this.activities.push(activity);
                this.activities = JSON.parse(JSON.stringify(this.activities)); //deepcopy
                this.changeFormatDate(this.activities);
            });
        }
        else { //modifica
            var selCriteria;
            selCriteria = new Object();
            selCriteria._id = this.newActivity._id;

            this.attivitaService.updateAttivita(this.newActivity, selCriteria).subscribe(event => {
                this.activities[attivitaTrovataIndex] = this.newActivity;
                this.activities = JSON.parse(JSON.stringify(this.activities)); //deepcopy
                this.changeFormatDate(this.activities);
            });
        }*/
        this.attivitaService.addAttivita(this.newActivity).subscribe(
            attivita => {
              if ( attivitaTrovataIndex == -1 )
                this.activities.push(attivita);
              else{
                this.activities[attivitaTrovataIndex] = attivita;
              }
              this.activities = JSON.parse(JSON.stringify(this.activities));
              this.changeFormatDate(this.activities);
            },
            error => {
                this.alertDialog = true;
                this.alertMsg = error;
            }
          );
          
        this.displayDialog = false;
    }

    public selectFromCliente(componentName, isEdit) {
        var selCriteria;
        selCriteria = new Object();
        selCriteria.id_cliente = this.newActivity.id_cliente;

        switch (componentName) {
            case 'ambito':
                if (!isEdit) {
                    /* this.activityForm.reset();
                    this.resetActivity(this.newActivity); */
                    this.newActivity.id_cliente = selCriteria.id_cliente;
                    switch(this.newActivity.nome_stato){
                        case "Aperto":
                            this.newActivity.stato_attivita = "OPEN";
                            break;
                        case "Chiuso":
                            this.newActivity.stato_attivita = "CLOSE";
                            break;
                        case "In Verifica":
                            this.newActivity.stato_attivita = "CHECK";
                            break;
                        case null:
                            this.newActivity.stato_attivita = "OPEN";
                            this.newActivity.nome_stato = "Aperto"
                    }
                }
                this.lst_ambiti = [];
                let ambitiCliente: any[] = this.clienti.find(x => x._id == this.newActivity.id_cliente).ambiti;

                this.ambiti.forEach(ambito => {
                    let elem: SelectItem = ambitiCliente.find(x => x.id_ambito == ambito.value);
                    if (elem != null)
                        this.lst_ambiti.push({ label: ambito.label, value: ambito.value })
                });
                this.ordinaLista(this.lst_ambiti);
                break; 
            case 'commessa_cliente':
                this.lst_commesse_clienti = [];
                this.commesse.forEach(element => {
                    if (element.id_cliente == selCriteria.id_cliente)
                        this.lst_commesse_clienti.push({ label: element.nome_commessa, value: element._id })
                });
                break;
            /*case 'cod_attivita':
                if(!isEdit)
                    this.newActivity.codice_attivita = ""+(Number(this.getMaxCodAttivita(this.newActivity.id_commessa_cliente))+1);
                break;*/
        }
    }

    private deleteRow(rowData, rowIndex) {
        var attivitaTrovataIndex = this.activities.findIndex(i => i._id == rowData._id);
        var selCriteria, consuntivoCount = 0;
        selCriteria = new Object();
        selCriteria.id_attivita = rowData._id;

        this.consuntivazioneSerice.getConsuntiviWithCriteria(selCriteria).subscribe(
            consuntivi => {
                consuntivi.forEach(element => {
                    if (element != null)
                        consuntivoCount++;
                });
                
                if (consuntivoCount == 0) {
                    selCriteria = new Object();
                    selCriteria._id = rowData._id;
                    this.confirmationService.confirm({
                        message: "Sei sicuro di voler eliminare l'attività '" + rowData.nome_attivita + "' ?",
                        header: 'Elimina attività',
                        icon: 'fa fa-trash',
                        accept: () => {
                            this.attivitaService.deleteAttivita(selCriteria).subscribe(event => {
                                this.activities.splice(attivitaTrovataIndex, 1);
                                this.activities = JSON.parse(JSON.stringify(this.activities)); //deepcopy
                                this.changeFormatDate(this.activities);
                            });
                        }
                    });
                }
                else {
                    this.alertDialog = true;
                    this.alertMsg = "Impossibile eliminare l'attivita', presenti consuntivi collegati!";
                }
            }
        );

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

    public isDisabled(componentName): boolean {
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
    public isValid(componentName: string) {
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
        attivita.budget_ore = null;
        attivita.budget_euro = null;

    }

    reset(dt: DataTable) {
        dt.reset();
    }

    public abortNew() {
        this.displayDialog = false;
    }

    /*public getMaxCodAttivita(idCommessaCliente){
        var maxCodAttivita;
        var activitiesFiltered : Attivita[];

        activitiesFiltered = this.activities.filter(x => x.id_commessa_cliente == idCommessaCliente);
        
        maxCodAttivita = activitiesFiltered.reduce(function(prev, current) {
            return (Number(prev.codice_attivita) > Number(current.codice_attivita)) ? prev : current
        }).codice_attivita; //returns object

        return maxCodAttivita;
    }*/

    ordinaLista(listName : SelectItem[]){
        listName.sort((a, b) => {
          if (a.label < b.label) return -1;
          else if (a.label > b.label) return 1;
          else return 0;
        });
      }
}