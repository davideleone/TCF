import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../service/cliente.service';
import { ConsuntivazioneService } from '../../service/consuntivazione.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
/*import { Angular2Csv } from 'angular2-csv/Angular2-csv';*/
import { DatePipe } from '@angular/common';

@Component({
    selector: 'report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css'],
    providers: [ClienteService, ConsuntivazioneService]
})

export class ReportComponent implements OnInit {
    dataInizio;
    dataFine;
    clienteSelected: string;
    modalitaSelected: string;
    lst_modalita: SelectItem[] = [{ label: 'Report Totale', value: 'r_totale' }, { label: 'Report Attivita', value: 'r_attivita' }];
    lst_clienti: SelectItem[] = [];
    formSubmitted: boolean = false;
    reportForm: FormGroup;
    alertDialog: boolean = false;
    alertMsg: string;
    header_csv_totale : string[] = ['Nome Cliente','Nome Ambito','Nome Macro Area','Cod. Commessa','Commessa Fnc','Attivita','Budget gg','Type of work','Cognome','Nome','Note','Ore','GG'];
    header_csv_attivita : string[] = ['Nome Cliente','Nome Ambito','Nome Macro Area','Attivita','Cod. Commessa','Attivita','Commessa Fnc','Nome Commessa Fnc','Note','Stato','Budget Ore','Data Inizio','Data Fine'];

    constructor(private formBuilder: FormBuilder,
        private clienteService: ClienteService,
        private consuntivazioneService: ConsuntivazioneService) {

        this.reportForm = this.formBuilder.group({
            modalita: new FormControl('', Validators.required),
            cliente: new FormControl('', Validators.required),
            dataInizio: new FormControl('', Validators.required),
            dataFine: new FormControl('', [Validators.required,this.controlDateValidator]),
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

    public checkForm(form) {
        this.formSubmitted = true;
        if (!form.valid) {
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

    public createReport() {
        /*var date = new DatePipe('en-US').transform(this.dataInizio, 'ddMMM')+'-'+new DatePipe('en-US').transform(this.dataFine, 'ddMMM');
        var cliente = this.lst_clienti.find(x => x.value == this.clienteSelected).label;

        var options = { 
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,  
          };

        switch (this.modalitaSelected) {
            case 'r_attivita':
                console.log('Report attivita');
                this.consuntivazioneService.getReportAttivita(this.clienteSelected, new Date(this.dataInizio).toISOString(), new Date(this.dataFine).toISOString()).subscribe(report => {
                    console.log(report);
                    options.headers = this.header_csv_attivita;
                    new Angular2Csv(report, 'ReportAttivita_'+cliente+'_'+date, options);
                })
                break;
            case 'r_totale':
                console.log('Report totale');
                this.consuntivazioneService.getReportTotale(this.clienteSelected, new Date(this.dataInizio).toISOString(), new Date(this.dataFine).toISOString()).subscribe(report => {
                    console.log(report);
                    options.headers = this.header_csv_totale;
                    new Angular2Csv(report, 'ReportTotale_'+cliente+'_'+date, options);
                })
                break;
        }*/
        alert("Creo Report");
    }

    public isValid(componentName: string) {
        if ((this.reportForm.get(componentName).touched || this.formSubmitted) && this.reportForm.get(componentName).errors)
            return "#a94442";
        else
            return "#898989"; //#d6d6d6
    }

    private DownloadJSON2CSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';

            for (var index in array[i]) {
                line += array[i][index] + ',';
            }

            // Here is an example where you would wrap the values in double quotes
            // for (var index in array[i]) {
            //    line += '"' + array[i][index] + '",';
            // }

            line.slice(0, line.length - 1);

            str += line + '\r\n';
        }
        window.open("data:text/csv;charset=utf-8," + str);// + _.escape(str))
    }
}