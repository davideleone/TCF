import { Component, OnChanges, Input, Inject, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';

import { Consuntivo } from '../../../../model/consuntivo';
import { MeseConsuntivo } from '../../../../model/meseConsuntivo';
import { User } from '../../../../model/user';
import { Cliente } from '../../../../model/cliente';
import { ConsuntivazioneService } from '../../../../service/consuntivazione.service';
import { DomainService } from '../../../../service/domain.service';
import { AttivitaService } from '../../../../service/attivita.service';
import { SelectItem, ConfirmationService } from 'primeng/primeng';
import { ClienteService } from '../../../../service/cliente.service';
import { MeseConsuntivoService } from '../../../../service/meseConsuntivo.service';
import * as Holidays from 'date-holidays';

@Component({
  selector: 'month-grid',
  templateUrl: './monthGrid.component.html',
  styleUrls: ['./monthGrid.component.css'],
  providers: [FormBuilder, DomainService, ConfirmationService]
})

export class MonthGridComponent implements OnChanges {

  @Input()
  monthSelected: number = 1;
  @Input()
  yearSelected: number = 2017;
  @Input()
  userSelected: User;
  @Output() newMonthOpened = new EventEmitter();


  displayDialog: boolean;
  settings: any = {};
  userDays: [Consuntivo];
  consuntivi: any;
  loading: boolean;
  cols: any[];
  formSubmitted: boolean = false;


  nDays: number;
  beforeOnInit: boolean = true;

  newRowConsuntivo: any;
  blankConsuntivo: Consuntivo;


  lst_clienti: SelectItem[];
  clienti: Cliente[];
  lst_ambiti: SelectItem[];
  ambiti: SelectItem[];
  lst_aree: SelectItem[];
  lst_attivita: SelectItem[];
  lst_deliverable: SelectItem[];
  consuntivoForm: FormGroup;

  hd: any;

  constructor(
    private consuntivazioneService: ConsuntivazioneService,
    private attivitaService: AttivitaService,
    private clienteService: ClienteService,
    private meseConsuntivoService: MeseConsuntivoService,
    private domainService: DomainService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
  ) {

    this.consuntivoForm = this.formBuilder.group({
      ddl_clienti: new FormControl('', Validators.required),
      ddl_ambiti: new FormControl('', Validators.required),
      ddl_aree: new FormControl('', Validators.required),
      ddl_attivita: new FormControl('', Validators.required),
      ddl_deliverable: new FormControl('', Validators.required),
    });

    this.newRowConsuntivo = new Object();
    this.blankConsuntivo = new Consuntivo()
    this.resetConsuntivo(this.newRowConsuntivo);

    //POPOLAMENTO LISTE
    this.lst_clienti = new Array<SelectItem>();
    this.lst_clienti = [];

    this.clienteService.getClienti().subscribe(clienti => {
      this.clienti = clienti;
    });

    this.lst_attivita = new Array<SelectItem>();
    this.attivitaService.getAttivita().subscribe(attivitas => {
      attivitas.forEach((item, index) => {
        this.lst_attivita.push({ label: item.nome_attivita, value: item._id });
      });

    });

    this.domainService.getTipiDeliverable().subscribe(domain => {
      this.lst_deliverable = domain;
    });

    this.domainService.getAree().subscribe(domain => {
      this.lst_aree = domain;
    });

    this.domainService.getAmbiti().subscribe(domain => {
      this.ambiti = domain;
    });
    
    this.hd = new Holidays('IT');

  }


  ngOnChanges() {


    if (this.beforeOnInit) {
      this.nDays = this.daysInMonth(this.monthSelected, this.yearSelected);
      //this.consuntivi = null;
    }

    this.initializeColumns();

    this.loading = true;

    setTimeout(() => {
      this.consuntivazioneService
        .getMeseConsuntivoUtente(this.userSelected._id, this.monthSelected, this.yearSelected)
        .subscribe(userDays => {
          this.userDays = userDays;
          this.consuntivi = this.buildData(this.userDays, this.nDays);
        });
      this.loading = false;
    }, 1000);

  }

  //GRID - LOAD

  //Inizializzazione header colonne dinamiche (giorni del mese)
  private initializeColumns() {
    this.consuntivi = null;
    this.cols = new Array(this.nDays);

    var i = 0;
this.hd.g
    while (i < this.nDays) {
      this.cols[i] = {};
      this.cols[i].field = (i).toString();
      this.cols[i].header = ((i) + 1).toString();
      //Identifico festività
      let date: Date = new Date(this.yearSelected, this.monthSelected - 1, i+1);
      if(this.hd.isHoliday(date) || date.getDay() == 0 || date.getDay() == 6 ){
        this.cols[i].cellStyle = "cellHoliday";
      }else{
        this.cols[i].cellStyle = "cellDay";
      }
      this.cols[i].isFrozen = false;
      i++;
    }
  }


  //costruisce il JSON con le colonne del calendario posizionando i valori recuperati nelle corrette posizioni
  private buildData(_userDays: Consuntivo[], _days: number): any[] {
    try {


      //ordino la _userDays per attività, data.

      const consuntivoComparator_AttivitaData = function (a: Consuntivo, b: Consuntivo): number {

        if (a.id_attivita == b.id_attivita) {
          return a.data_consuntivo > b.data_consuntivo ? 1 : a.data_consuntivo < b.data_consuntivo ? -1 : 0;
        }

        return a.id_attivita > b.id_attivita ? 1 : -1;
      }

      _userDays.sort(consuntivoComparator_AttivitaData);


      var rowCount: number = 0;
      var last: Consuntivo;
      //conto il numero di attività (righe della tabella) --> come fare un distinct su id_attivita/id_tipo_deliverable
      for (let current_cons of _userDays) {
        if (!last) {
          //primo elemento;
          last = current_cons;
          rowCount++;
          continue;
        }

        if (current_cons.id_attivita != last.id_attivita || current_cons.id_tipo_deliverable != last.id_tipo_deliverable) {
          rowCount++;
        }
        last = current_cons;

      }

      //var userDaysIndex: number = 0;

      var rowsCollection: any[] = new Array(0);
      var row: any;

      var i = 0;
      while (i < rowCount) {

        row = new Object();

        row.id_cliente = _userDays[i].id_cliente;
        row.nome_cliente = _userDays[i].nome_cliente;
        row.id_ambito = _userDays[i].id_ambito;
        row.nome_ambito = _userDays[i].nome_ambito;
        row.id_macro_area = _userDays[i].id_macro_area;
        row.nome_macro_area = _userDays[i].nome_macro_area;
        row.id_attivita = _userDays[i].id_attivita;
        row.nome_attivita = _userDays[i].nome_attivita;
        row.id_tipo_deliverable = _userDays[i].id_tipo_deliverable;
        row.nome_tipo_deliverable = _userDays[i].nome_tipo_deliverable;
        row.id_utente = this.userSelected._id;
        row.isEditable = false;

        this.cloneConsuntivoField(row, this.blankConsuntivo);
        this.blankConsuntivo.ore = 0;


        //ciclo sulle colonne
        for (let j = 0; j < _days; j++) {

          let consuntivoDayOfMonth = -1;

          if (i < _userDays.length) {
            let consuntivoDateFull = _userDays[i].data_consuntivo;
            consuntivoDayOfMonth = new Date(consuntivoDateFull).getUTCDate();
          } else {
            consuntivoDayOfMonth = -1;
          }


          
          //inserire class girgio in html se isHoliday = true
          if ((j + 1) == consuntivoDayOfMonth) { //aggiungo 1 visto che l'indice parte da 0;

            row[j] = _userDays[i];
            i++; //scorro la lista, potrei fare un pop dalla testa.
          } else {
            var blankItem = JSON.parse(JSON.stringify(this.blankConsuntivo));
            blankItem.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, j + 1, 0, 0, 0, 0);

            row[j] = blankItem;
          }
          
        }
        //rowsCollection[i] = row;    
        rowsCollection.push(row);
      }

      console.log(rowsCollection);

    } catch (error) {
      alert(error);
    } finally {
      return rowsCollection;
    }
  }


  //GRID - ACTION

  //NEW ROW
  private showDialogToAdd() {
    //Inizializzazione dei parametri di input
    this.lst_clienti = [];
    //TODO: gestire clienteuser.cliente.id == null
    this.clienti.forEach(clienteAll => {
      this.userSelected.clienti.forEach(clienteUser => {
        if (clienteAll._id == clienteUser.cliente._id)
          this.lst_clienti.push({ label: clienteAll.nome_cliente, value: clienteAll._id });
      });
    });
    
    this.resetConsuntivo(this.newRowConsuntivo);
    this.newRowConsuntivo.id_utente = this.userSelected._id;
    this.consuntivoForm.reset();
    this.formSubmitted = false;
    this.displayDialog = true;

  }

  private abortNew() {
    this.displayDialog = false;
  }

  //SAVE NEW ROW
  private saveNew() {
    //Inserisco solo il primo giorno 0 per effettuare lo store dell'activity su DB 
    this.newRowConsuntivo.id_utente = this.userSelected._id.toString();
    this.newRowConsuntivo.nome_cliente = this.lst_clienti.find(x => x.value == this.newRowConsuntivo.id_cliente).label;
    this.newRowConsuntivo.nome_ambito = this.lst_ambiti.find(x => x.value == this.newRowConsuntivo.id_ambito).label;
    this.newRowConsuntivo.nome_macro_area = this.lst_aree.find(x => x.value == this.newRowConsuntivo.id_macro_area).label;
    this.newRowConsuntivo.nome_attivita = this.lst_attivita.find(x => x.value == this.newRowConsuntivo.id_attivita).label;
    this.newRowConsuntivo.nome_tipo_deliverable = this.lst_deliverable.find(x => x.value == this.newRowConsuntivo.id_tipo_deliverable).label;
    this.newRowConsuntivo.ore = 0;


    //TODO: Verifico che non sia già presente tra quelle visualizzate


    //Se è la prima riga inserita del mese devo creare anche il mese /sarebbe da creare il servizio ad-hoc server side
    if (this.consuntivi.length == 0) {
      var meseConsuntivo: MeseConsuntivo = new MeseConsuntivo();
      meseConsuntivo.anno_consuntivo = this.yearSelected.toString();
      meseConsuntivo.mese_consuntivo = this.monthSelected.toString();
      meseConsuntivo.id_utente = this.userSelected._id.toString();
      meseConsuntivo.nome_stato = "Aperto";
      this.meseConsuntivoService.addMeseConsuntivo(meseConsuntivo).subscribe(
        obj => {
          this.addConsuntivo();
        },
        err => {
          alert("errore nell'inserimento del mese")
        }
      );     
      this.refreshMonthList();
    } else {
      this.addConsuntivo();
    }
  }

  private refreshMonthList(){
    this.newMonthOpened.emit();
  }

  private addConsuntivo() {
    this.consuntivazioneService.addConsuntivo(this.newRowConsuntivo).subscribe
      (obj => {
        var newCons: any = JSON.parse(JSON.stringify(obj));

        //inizializzo la nuova riga con 0 ore su tutti i gg 
        this.cloneConsuntivoField(this.newRowConsuntivo, this.blankConsuntivo);
        this.blankConsuntivo.ore = 0;
        this.blankConsuntivo.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, 1, 0, 0, 0, 0);
        //inizializzo la table
        for (let i = 0; i < this.nDays; i++) {
          var blankItem = JSON.parse(JSON.stringify(this.blankConsuntivo));
          blankItem.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, i + 1, 0, 0, 0, 0);
          newCons[i] = blankItem;
        }
        //var deepCopyObj = JSON.parse(JSON.stringify(this.newConsuntivo));
        this.consuntivi = this.consuntivi.concat(newCons);
        this.displayDialog = false;
      },
      err => {
        alert(err);
      }
      );
  }


  //EDIT ROW (INLINE)
  private edit(r, i) {
    console.log(r);
    this.CloseAllEditable();
    r.isEditable = true;
  }
  private CloseAllEditable() {
    for (let item of this.consuntivi) {
      if (item.isEditable) {
        item.isEditable = false;
      }
    }
  }

  //SAVE ROW (INLINE)
  private saveEdit(editRowConsuntivo, index) {
    editRowConsuntivo.nome_attivita = this.lst_attivita.find(x => x.value == editRowConsuntivo.id_attivita).label;
    editRowConsuntivo.nome_tipo_deliverable = this.lst_deliverable.find(x => x.value == editRowConsuntivo.id_tipo_deliverable).label;

    var consuntiviToAdd: Consuntivo[] = new Array<Consuntivo>();

    for (let i = 0; i < this.nDays; i++) {
      if (editRowConsuntivo[i]._id != null || editRowConsuntivo[i].ore > 0) {
        editRowConsuntivo[i].nome_attivita = this.lst_attivita.find(x => x.value == editRowConsuntivo.id_attivita).label;
        editRowConsuntivo[i].nome_tipo_deliverable = this.lst_deliverable.find(x => x.value == editRowConsuntivo.id_tipo_deliverable).label;
        consuntiviToAdd.push(editRowConsuntivo[i]);
      }
    }
    if (consuntiviToAdd.length > 0) {
      this.consuntivazioneService
        .addUpdateConsuntivi(consuntiviToAdd)
        .subscribe(obj => {
          alert(obj.msg);
        },
        err => alert(err)
        );
    }
    editRowConsuntivo.isEditable = false;
  }

  private abortEdit(r, i) {
    //TODO: logica di annullo modifiche (annullo modifiche parziali e ripristino riga precedente)
    r.isEditable = false;
  }

  //DELETE ROW
  private delete(r, i) {

    var delCriteria;
    delCriteria = new Object();
    delCriteria.id_utente = r.id_utente;
    delCriteria.id_macro_area = r.id_macro_area;
    delCriteria.id_ambito = r.id_ambito;
    delCriteria.id_attivita = r.id_attivita;
    delCriteria.id_tipo_deliverable = r.id_tipo_deliverable;

    this.confirmationService.confirm({
      message: "Sei sicuro di voler eliminare '" + r.nome_attivita + "' ?",
      header: 'Elimina consuntivo',
      icon: 'fa fa-trash',
      accept: () => {
        this.consuntivazioneService.deleteConsuntivi(delCriteria).subscribe(msg => {
          this.consuntivi.splice(i, 1);
          this.consuntivi = Object.create(this.consuntivi); //deepcopy    
        });
      }
    });
  }

  //UTILITY
  private daysInMonth(month, year) {
    return new Date(year, month, 0).getUTCDate();
  }

  private resetConsuntivo(consuntivo: any) {
    consuntivo.id_utente = null;
    consuntivo.id_cliente = null;
    consuntivo.nome_cliente = null;
    consuntivo.id_ambito = null;
    consuntivo.nome_ambito = null;
    consuntivo.id_macro_area = null;
    consuntivo.nome_macro_area = null;
    consuntivo.id_attivita = null;
    consuntivo.nome_attivita = null;
    consuntivo.id_tipo_deliverable = null;
    consuntivo.nome_tipo_deliverable = null;
    consuntivo.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, 1, 0, 0, 0, 0);

  }


  private cloneConsuntivoField(consuntivoSource: any, consuntivoTarget: any) {
    consuntivoTarget.id_utente = consuntivoSource.id_utente;
    consuntivoTarget.id_cliente = consuntivoSource.id_cliente;
    consuntivoTarget.nome_cliente = consuntivoSource.nome_cliente;
    consuntivoTarget.id_ambito = consuntivoSource.id_ambito;
    consuntivoTarget.nome_ambito = consuntivoSource.nome_ambito;
    consuntivoTarget.id_macro_area = consuntivoSource.id_macro_area;
    consuntivoTarget.nome_macro_area = consuntivoSource.nome_macro_area;
    consuntivoTarget.id_attivita = consuntivoSource.id_attivita;
    consuntivoTarget.nome_attivita = consuntivoSource.nome_attivita;
    consuntivoTarget.id_tipo_deliverable = consuntivoSource.id_tipo_deliverable;
    consuntivoTarget.nome_tipo_deliverable = consuntivoSource.nome_tipo_deliverable;
    consuntivoTarget.data_consuntivo = consuntivoSource.data_consuntivo;
  }

  /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
  private checkForm(form) {
    this.formSubmitted = true;
    return form.valid;
  }

  private selectFromCliente(componentname) {
    var selCriteria;
    selCriteria = new Object();
    selCriteria.id_cliente = this.newRowConsuntivo.id_cliente;

    switch (componentname) {
      case 'attivita':        
        this.lst_attivita = [];
        this.attivitaService.getAttivitaByCliente(selCriteria).subscribe(attivita => {
          attivita.forEach(element => {
            this.lst_attivita.push({ label: element.nome_attivita, value: element._id });
          });
        })
        break;
      case 'ambito':
        this.consuntivoForm.reset();
        this.resetConsuntivo(this.newRowConsuntivo);
        this.newRowConsuntivo.id_cliente = selCriteria.id_cliente;       
        this.lst_ambiti = [];
        
        let ambitiCliente: any[] = this.clienti.find(x => x._id == this.newRowConsuntivo.id_cliente).ambiti;
        
        this.ambiti.forEach(ambito => {
            let elem: SelectItem = ambitiCliente.find(x=> x.id_ambito == ambito.value); 
            if (elem != null)
                this.lst_ambiti.push({ label: ambito.label, value: ambito.value })
        });
        break;

    }
  }

  private isDisabled(componentName): boolean {
    var disabled = false;

    switch (componentName) {
      case 'ambito': disabled = this.newRowConsuntivo.id_cliente == null;
        break;
      case 'macro_area': disabled = this.newRowConsuntivo.id_cliente == null;
        break;
      case 'attivita': disabled = this.newRowConsuntivo.id_cliente == null || this.newRowConsuntivo.id_ambito == null || this.newRowConsuntivo.id_macro_area == null;
        break;
      case 'deliverable': disabled = this.newRowConsuntivo.id_cliente == null || this.newRowConsuntivo.id_ambito == null || this.newRowConsuntivo.id_macro_area == null || this.newRowConsuntivo.id_attivita == null;
        break;
    }

    return disabled;
  }

  private isValid(componentName: string) {
    if ((this.consuntivoForm.get(componentName).touched || this.formSubmitted) && this.consuntivoForm.get(componentName).errors)
      return "#a94442";
    else
      return "#898989"; //#d6d6d6
  }


}
