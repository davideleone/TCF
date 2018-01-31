import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../service/cliente.service';
import { ReportService } from '../../service/report.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from '../../service/authentication.service';

import * as moment from 'moment'

@Component({
    selector: 'report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css'],
    providers: [ClienteService, ReportService]
})


export class ReportComponent implements OnInit {
    userLogged;
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
    header_csv_totale: string[] = ['Nome Cliente', 'Nome Ambito', 'Nome Macro Area', 'Cod. Commessa', 'Commessa Fnc', 'Attivita', 'Budget gg', 'Type of work', 'Cognome', 'Nome', 'Note', 'Ore', 'GG'];
    header_csv_attivita: string[] = ['Nome Cliente', 'Nome Ambito', 'Nome Macro Area', 'Attivita', 'Cod. Commessa', 'Attivita', 'Commessa Fnc', 'Nome Commessa Fnc', 'Note', 'Stato', 'Budget Ore', 'Data Inizio', 'Data Fine'];

    constructor(private formBuilder: FormBuilder,
        private clienteService: ClienteService,
        private reportService: ReportService,
        private authenticationService: AuthenticationService) {

        this.dataInizio = new DatePipe('en-US').transform(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'dd/MM/yyyy');
        this.dataFine = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0);

        this.reportForm = this.formBuilder.group({
            modalita: new FormControl('', Validators.required),
            cliente: new FormControl('', Validators.required),
            dataInizio: new FormControl('', Validators.required),
            dataFine: new FormControl('', [Validators.required, this.controlDateValidator]),
        });
    }

    ngOnInit() {
        this.getInformations();
    }

    getInformations() {

        this.authenticationService.user$.subscribe(user => {
            this.userLogged = user;
        });

        if (!this.userLogged.isAdmin) { //gestione filtro per clienti dell'utente loggato
            var selClientiCriteria = []

            this.userLogged.clienti.forEach(clientiUser => {
                selClientiCriteria.push(clientiUser.cliente._id);
            });

            this.clienteService.getClientiByUser(selClientiCriteria).subscribe(clientiAll => {
                clientiAll.forEach(clienti => {
                    this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
                });
            });
        }
        else {
            this.clienteService.getClienti().subscribe(clienti => {
                clienti.forEach(clienti => {
                    this.lst_clienti.push({ label: clienti.nome_cliente, value: clienti._id });
                });
            });
        }
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

        var date = new DatePipe('en-US').transform(new Date(this.dataInizio), 'ddMMM') + '-' + new DatePipe('en-US').transform(new Date(this.dataFine), 'ddMMM');
        var cliente = this.lst_clienti.find(x => x.value == this.clienteSelected).label;

        var options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
        };

        var convertedStartDate = moment(this.dataInizio).format('LLLL');
        convertedStartDate = moment(convertedStartDate).format('YYYY-MM-DDT00:00:00');
        var convertedEndDate = moment(this.dataFine).format('LLLL');
        convertedEndDate = moment(convertedEndDate).format('YYYY-MM-DDT23:59:59');


        var reportDownloadParams = {
            clientId: this.clienteSelected,
            start: convertedStartDate.toString(),
            end:  convertedEndDate.toString(),
            type: this.modalitaSelected
        };

        this.reportService.getReportistica(reportDownloadParams).subscribe(report => {
            
            switch (reportDownloadParams.type) {
                case 'r_totale':
                    report.forEach(element => {
                        element.data_consuntivo = new DatePipe('en-US').transform(new Date(element.data_consuntivo), 'dd/MM/yyyy')
                        /*if(element.desc_consuntivo == null)
                            element.desc_consuntivo = ' ';*/
                    });
                    this.JSONToCSVConvertor(report, 'report-totale');
                    break;
                case 'r_attivita':
                    report.forEach(element => {
                        element.data_inizio = new DatePipe('en-US').transform(new Date(element.data_inizio), 'dd/MM/yyyy')
                        if (element.data_fine != null)
                            element.data_fine = new DatePipe('en-US').transform(new Date(element.data_fine), 'dd/MM/yyyy')
                        /*if(element.desc_consuntivo == null)
                            element.desc_consuntivo = ' ';*/
                    });
                    this.JSONToCSVConvertor(report, 'report-attivita');
                    break;
                default:
                    break;
            }
        })

    }

    public isValid(componentName: string) {
        if ((this.reportForm.get(componentName).touched || this.formSubmitted) && this.reportForm.get(componentName).errors)
            return "#a94442";
        else
            return "#898989"; //#d6d6d6
    }

    public JSONToCSVConvertor(JSONData, reportName) {

        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';

        var row = "";
        for (var index in arrData[0]) {
            row += index + ',';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';

        for (var i = 0; i < arrData.length; i++) {
            var row = "";

            for (var index in arrData[i]){
                var tmp = arrData[i][index];
                if(tmp == null || tmp.length < 1)
                    tmp = "N/D";

                row += '"' + tmp + '",';
            }
        

            row.slice(0, row.length - 1);
            CSV += row + '\r\n';
        }

        if (CSV.length < 1) {
            alert("Dati vuoti per il CSV");
            return;
        }

        //Generate a file name
        var date = new Date();

        var fileName = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString() + '_' + reportName;
        fileName = fileName.replace(/ /g, "_");
        var uri = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(CSV);
        //Create hidden link for download
        var link = document.createElement("a");
        link.href = uri;
        link.download = fileName + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}

