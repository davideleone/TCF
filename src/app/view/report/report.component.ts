import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { SelectItem } from 'primeng/primeng';
import { ClienteService } from '../../service/cliente.service';
import { ReportService } from '../../service/report.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css'],
    providers: [ClienteService, ReportService]
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
        private reportService: ReportService) {

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
    
        var date = new DatePipe('en-US').transform(this.dataInizio, 'ddMMM')+'-'+new DatePipe('en-US').transform(this.dataFine, 'ddMMM');
        var cliente = this.lst_clienti.find(x => x.value == this.clienteSelected).label;

        var options = { 
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,  
        };

        var reportDownloadParams = {
            clientId: this.clienteSelected,
            start: new Date(this.dataInizio).toISOString(),
            end: new Date(this.dataFine).toISOString(),
            type: this.modalitaSelected
        };

        this.reportService.getReportistica(reportDownloadParams).subscribe(report => {
            switch (reportDownloadParams.type) {
                case 'r_totale':
                    this.JSONToCSVConvertor(report,'report-totale');
                    break;
                case 'r_attivita':
                    this.JSONToCSVConvertor(report,'report-attivita');
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

        console.log(arrData);

        //This condition will generate the Label/Header
        var row = "";
        for (var index in arrData[0]) {
            row += index + ',';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';

        for (var i = 0; i < arrData.length; i++) {
            var row = "";

            for (var index in arrData[i]) 
                row += '"' + arrData[i][index] + '",';

            row.slice(0, row.length - 1);
            CSV += row + '\r\n';
        }

        if (CSV == '') {        
            alert("Invalid data");
            return;
        }   
        
        //Generate a file name
        var date = new Date();
        
        var fileName =  date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString() + '_' + reportName;
        fileName = fileName.replace(/ /g,"_");   
        var uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV);
        //Create hidden link for download
        var link = document.createElement("a");    
        link.href = uri;
        link.download = fileName + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

