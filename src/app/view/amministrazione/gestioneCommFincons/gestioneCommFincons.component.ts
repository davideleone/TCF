import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Injectable, ViewEncapsulation } from '@angular/core';

import { SelectItem } from 'primeng/primeng';
import { ConfirmationService, DataTable } from 'primeng/primeng';
import { AuthenticationService } from '../../../service/authentication.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CommessaFincons } from '../../../model/commessaFincons';
import { CommessaFinconsService } from '../../../service/commessaFincons.service';
import { CommessaClienteService } from '../../../service/commessaCliente.service';

@Component({
    selector: 'gestioneCommessaFincons',
    templateUrl: './gestioneCommFincons.component.html',
    styleUrls: ['./gestioneCommFincons.component.css'],
    providers: [ CommessaClienteService, CommessaFinconsService, FormBuilder, AuthenticationService, ConfirmationService],
    // encapsulation: ViewEncapsulation.None
})

export class GestioneCommFinconsComponent implements OnInit {

    CommFinconsClone: CommessaFincons;
    commFinconss: CommessaFincons[];
    newCommFincons: CommessaFincons;
    commessaFincons: CommessaFincons[];
    headerCommFincons: string;
    CommFinconsIndex: any;
    displayDialog: boolean;
    CommFinconsForm: FormGroup;
    formSubmitted: boolean = false;   
    commesseFnc: SelectItem[]; //TODO: full list to avoid other call. sostituire con hide/show degli elementi tramite css
    alertDialog: boolean = false;
    alertMsg: string;
    
    constructor(private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private commessaFinconsService: CommessaFinconsService,
        private commessaClienteService: CommessaClienteService
    ) {

        this.newCommFincons = new CommessaFincons();
        this.commFinconss = new Array<CommessaFincons>();

        this.CommFinconsForm = this.formBuilder.group({
            nome_commFincons: new FormControl('', Validators.required),
            cod_commFincons: new FormControl('', Validators.required),
            data_inizio: new FormControl('', Validators.required),
            data_fine: new FormControl('', this.controlDateValidator),
        });
    }

    ngOnInit() {
        this.getInformations();
    }

    getInformations() {
        this.commessaFinconsService.getCommesse().subscribe(commesse => {
            this.commFinconss = commesse;
        });


    }

    addNewCommFincons() {
        this.newCommFincons = new CommessaFincons();
        this.formSubmitted = false;
        this.headerCommFincons = "Aggiungi Commessa Fincons";
        //this.btnDialog = "Aggiungi";
        this.CommFinconsIndex = null;
        this.displayDialog = true;
        this.CommFinconsForm.reset();
        this.newCommFincons.data_inizio_validita = new Date();
        
    }

    /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
    public checkForm(form) {
        this.formSubmitted = true;
        return form.valid;
    }

    saveNew() {    
    
    var commFinconsTrovatoIndex = this.commFinconss.findIndex(i => i._id == this.newCommFincons._id && this.newCommFincons._id != undefined);
        if(this.newCommFincons.budget_euro==null)
            this.newCommFincons.budget_euro = 0;
        if(this.newCommFincons.budget_gg==null)
            this.newCommFincons.budget_gg = 0;

        if (commFinconsTrovatoIndex == -1) { //aggiunta
            this.commessaFinconsService.addcommessaFincons(this.newCommFincons).subscribe(commessaFincons => {
                this.displayDialog = false;
                this.commFinconss.push(commessaFincons);
                this.commFinconss = JSON.parse(JSON.stringify(this.commFinconss)); //deepcopy
                this.changeFormatDate(this.commFinconss);
            },
            error => {
                this.alertDialog = true;
                this.alertMsg = error;
            });
        }
        else { //modifica
            var selCriteria;
            selCriteria = new Object();
            selCriteria._id = this.newCommFincons._id;
            this.commessaFinconsService.updatecommessaFincons(this.newCommFincons, selCriteria).subscribe(event => {
                this.displayDialog = false;
                this.commFinconss[commFinconsTrovatoIndex] = this.newCommFincons;
                this.commFinconss = JSON.parse(JSON.stringify(this.commFinconss)); //deepcopy
                this.changeFormatDate(this.commFinconss);
            },
            error => {
                this.alertDialog = true;
                this.alertMsg = error;
            });
        }
    }

    private deleteRow(rowData, rowIndex) {
        var commFinconsTrovatoIndex = this.commFinconss.findIndex(i => i._id == rowData._id);
        
        var selCriteria, commesseCount = 0;
        selCriteria = new Object();
        selCriteria.id_commessa_fnc = rowData._id;

        this.commessaClienteService.getCommessaWithCriteria(selCriteria).subscribe(
            commesse =>{
                commesse.forEach(element => {
                    if(element != null)
                        commesseCount++;
                });

            if(commesseCount == 0){ //nessuna commessa cliente collegata
                selCriteria = new Object();
                selCriteria._id = rowData._id;
                this.confirmationService.confirm({
                    message: "Sei sicuro di voler eliminare la commessa '" + rowData.nome_commessa + "' ?",
                    header: 'Elimina Commessa Cliente',
                    icon: 'fa fa-trash',
                    accept: () => {
                        this.commessaFinconsService.deletecommessaFincons(selCriteria).subscribe(event => {
                            this.commFinconss.splice(commFinconsTrovatoIndex, 1);
                            this.commFinconss = JSON.parse(JSON.stringify(this.commFinconss)); //deepcopy
                            this.changeFormatDate(this.commFinconss);
                        });
                    }
                });
            }
            else{
                this.alertDialog = true;
                this.alertMsg = "Impossibile eliminare la commessa, presenti commesse cliente collegate!";
            }

            }
        )

        
    }


    private editRow(rowData, rowIndex) {
        this.newCommFincons = JSON.parse(JSON.stringify(rowData));
        //this.changeFormatDate(this.newCommFincons);
        this.newCommFincons.data_inizio_validita = new Date(rowData.data_inizio_validita);
        this.newCommFincons.data_fine_validita = rowData.data_fine_validita != null ? new Date(rowData.data_fine_validita) : null;
        this.headerCommFincons = "Modifica Commessa - " + this.newCommFincons.nome_commessa;
        //this.btnDialog = "Modifica";
        this.CommFinconsIndex = rowIndex;
        this.displayDialog = true;
        this.formSubmitted = false;
    }

    private changeFormatDate(commFinconss: CommessaFincons[]) {
        commFinconss.forEach(CommCli => {
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


//TODO da gestire esternamente con CSS!!
    public isValid(componentName: string) {
        if ((this.CommFinconsForm.get(componentName).touched || this.formSubmitted) && this.CommFinconsForm.get(componentName).errors)
            return "#a94442";
        else
            return "#898989"; //#d6d6d6
    }

    private resetCommCli(commFincons: CommessaFincons) {
        commFincons.budget_euro = null;
        commFincons.budget_gg = null;        
        commFincons.data_fine_validita = null;
        commFincons.data_inizio_validita = new Date();
        commFincons.data_fine_validita = null;
        commFincons.codice_commessa = null;
        commFincons.nome_commessa = null;        
    }

    reset(dt: DataTable){
        dt.reset();
    }

    public abortNew() {
        this.displayDialog = false;
      }
}