import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../service/cliente.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css'],
    providers: [ClienteService]
  })
  
  export class ReportComponent implements OnInit{
    dataInizio;
    dataFine;
    clienteSelected : string;
    modalitaSelected : string;
    lst_modalita: SelectItem[] = [{label: 'Report Totale', value:'r_totale'},{label: 'Report Attivita', value: 'r_attivita'}];
    lst_clienti : SelectItem[] = [];
    formSubmitted : boolean = false;
    reportForm : FormGroup;
    alertDialog : boolean = false;
    alertMsg : string;
    

    constructor(private formBuilder: FormBuilder,
            private clienteService : ClienteService){

        this.reportForm = this.formBuilder.group({
            modalita: new FormControl('', Validators.required),
            cliente: new FormControl('', Validators.required),
            dataInizio: new FormControl('', Validators.required),
            dataFine: new FormControl('', this.controlDateValidator),
        });
    }

    ngOnInit() {
        this.getInformations();
    }

    getInformations() {
        this.clienteService.getClienti().subscribe(clienti => {
            clienti.forEach(clienti => {
                this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
            });
        });
    }

    private checkForm(form) {
        this.formSubmitted = true;
        if(!form.valid){
            this.alertDialog = true;
            this.alertMsg = "Alcuni campi non stati compilati correttamente!";
        }

        return form.valid;
    }

    private controlDateValidator(control: FormControl) {
        let dataInizio = control.root.value['dataInizio'] != null ? control.root.value['dataInizio'] : null;
        let dataFine = control.value;
        if (dataInizio > dataFine && dataFine != null) {
            return { controlDate: true }
        }
        return null;
    }

    private createReport(){
        alert("Creo Report");
    }

    private isValid(componentName: string) {
        if ((this.reportForm.get(componentName).touched || this.formSubmitted) && this.reportForm.get(componentName).errors)
            return "#a94442";
        else
            return "#898989"; //#d6d6d6
    }
  }