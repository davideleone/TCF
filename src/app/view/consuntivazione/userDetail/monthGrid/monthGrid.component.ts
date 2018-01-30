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
import { Attivita } from '../../../../model/attivita';

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
  lst_attivita_clone: SelectItem[] = [];
  lst_deliverable: SelectItem[];
  lst_deliverable_clone: SelectItem[] = [];
  consuntivoForm: FormGroup;

  attivitaList: Attivita[];
  hd: any;
  attivitaDeliverableList: any = [];
  displayNote: boolean = false;
  isNoteEditable: boolean = false;
  noteConsuntivo: string = null;
  noteIndex: number = null;

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
      this.attivitaList = attivitas;
      attivitas.forEach((item, index) => {
        this.lst_attivita.push({ label: item.nome_attivita, value: item._id });
      });

    });

    this.domainService.getAree().subscribe(domain => {
      this.lst_aree = domain;
    });

    this.domainService.getAmbiti().subscribe(domain => {
      this.ambiti = domain;
    });

    this.hd = new Holidays('IT');

    this.attivitaDeliverableList = new Object();
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


  private getDeliverableList(idAttivita,editedObject){
    var deliverableTrovata = {};
    this.domainService.getTipiDeliverable().subscribe(list => {
      this.lst_deliverable = list;

        this.lst_deliverable_clone = [];
        if (editedObject != null) {
          this.lst_deliverable_clone.push(editedObject);
        }

        this.lst_deliverable.forEach(elements => {
          if (this.consuntivi != null)
            deliverableTrovata = this.consuntivi.find(x => x.id_attivita == idAttivita && x.id_tipo_deliverable == elements.value)
          if (deliverableTrovata == null)
            this.lst_deliverable_clone.push(elements);
        });

      });
  }

  private getDeliverableForAM(idAttivita ,editedObject){
    var deliverableTrovata = {};
    this.domainService.getTipiDeliverableAM().subscribe(list => {
      this.lst_deliverable = list;

        this.lst_deliverable_clone = [];
        if (editedObject != null) {
          this.lst_deliverable_clone.push(editedObject);
        }

        this.lst_deliverable.forEach(elements => {
          if (this.consuntivi != null)
            deliverableTrovata = this.consuntivi.find(x => x.id_attivita == idAttivita && x.id_tipo_deliverable == elements.value)
          if (deliverableTrovata == null)
            this.lst_deliverable_clone.push(elements);
        });

      });
  }

  //GRID - LOAD

  //Inizializzazione header colonne dinamiche (giorni del mese)
  private initializeColumns() {
    this.consuntivi = null;
    this.cols = new Array(this.nDays);
    var i = 0;
    while (i < this.nDays) {
      this.cols[i] = {};
      this.cols[i].field = (i).toString();
      this.cols[i].header = ((i) + 1).toString();
      //Identifico festività
      let date: Date = new Date(this.yearSelected, this.monthSelected - 1, i + 1);
      if (this.hd.isHoliday(date) || date.getDay() == 0 || date.getDay() == 6) {
        this.cols[i].cellStyle = "cellHoliday";
      } else {
        this.cols[i].cellStyle = "cellDay";
      }
      this.cols[i].isFrozen = false;
      i++;
    }
  }


  //costruisce il JSON con le colonne del calendario posizionando i valori recuperati nelle corrette posizioni
  private buildData(_userDays: Consuntivo[], _days: number): any[] {
    try {


      //ordino la _userDays per attività, tipodeliverable, data.

      const consuntivoComparator_AttivitaData = function (a: Consuntivo, b: Consuntivo): number {

        if (a.id_attivita == b.id_attivita) {
          if (a.id_tipo_deliverable == b.id_tipo_deliverable) {
            return a.data_consuntivo > b.data_consuntivo ? 1 : a.data_consuntivo < b.data_consuntivo ? -1 : 0;
          } else {
            return a.id_tipo_deliverable > b.id_tipo_deliverable ? 1 : -1;
          }
        } else {
          return a.id_attivita > b.id_attivita ? 1 : -1;
        }
      }

      _userDays.sort(consuntivoComparator_AttivitaData);



      var rowCount: number = 0;
      var last: Consuntivo;
      var groupedActivities: any[] = new Array(0);;

      //conto il numero di attività (righe della tabella) --> come fare un distinct su id_attivita/id_tipo_deliverable
      for (let current_cons of _userDays) {
        if (!last) {
          //primo elemento;
          last = current_cons;
          groupedActivities.push(current_cons);
          //rowCount++;

          continue;
        }

        if (current_cons.id_attivita != last.id_attivita || current_cons.id_tipo_deliverable != last.id_tipo_deliverable) {
          //rowCount++;
          groupedActivities.push(current_cons);
        }
        last = current_cons;

      }

      //var userDaysIndex: number = 0;

      var rowsCollection: any[] = new Array(0);
      var row: any;

      var i = 0;


      //while (i < rowCount) {
      groupedActivities.forEach((group_act, index) => {

        row = new Object();

        row.id_cliente = group_act.id_cliente;
        row.nome_cliente = group_act.nome_cliente;
        row.id_ambito = group_act.id_ambito;
        row.nome_ambito = group_act.nome_ambito;
        row.id_macro_area = group_act.id_macro_area;
        row.nome_macro_area = group_act.nome_macro_area;
        row.id_attivita = group_act.id_attivita;
        row.nome_attivita = group_act.nome_attivita;
        row.id_tipo_deliverable = group_act.id_tipo_deliverable;
        row.nome_tipo_deliverable = group_act.nome_tipo_deliverable;
        row.id_utente = this.userSelected._id;
        row.note = group_act.note;
        row.isEditable = false;

        this.cloneConsuntivoField(row, this.blankConsuntivo);
        this.blankConsuntivo.ore = 0;

        //filtro solo i consuntivi relativi a questo group_act
        let filtered_userDays: Consuntivo[] = _userDays.filter(
          (consuntivo: Consuntivo) => consuntivo.id_attivita == group_act.id_attivita
            && consuntivo.id_tipo_deliverable == group_act.id_tipo_deliverable);

        //inizializzo tutte le colonne a blank
        for (let j = 0; j < _days; j++) {
          var blankItem = JSON.parse(JSON.stringify(this.blankConsuntivo));
          blankItem.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, j + 1, 1, 0, 1, 0);
          row[j] = blankItem;
        }

        //sostituisco con i valori passati dal server
        filtered_userDays.forEach((userDay, index) => {

          let consuntivoDateFull = userDay.data_consuntivo;
          let consuntivoDayOfMonth = new Date(consuntivoDateFull).getUTCDate();

          row[consuntivoDayOfMonth - 1] = userDay;

        });
        //rowsCollection[i] = row;    
        rowsCollection.push(row);
      });


    } catch (error) {
      alert(error);
    } finally {
      return rowsCollection;
    }
  }


  //GRID - ACTION

  //NEW ROW
  public showDialogToAdd() {
    //Inizializzazione dei parametri di input
    this.CloseAllEditable();
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
    this.lst_attivita_clone = [];
    this.filtraAttivitaCombo(false, null, null, null);
    this.lst_deliverable_clone = [];
    this.formSubmitted = false;
    this.displayDialog = true;

  }

  public abortNew() {
    this.displayDialog = false;
  }

  //SAVE NEW ROW
  public saveNew() {
    //Inserisco solo il primo giorno 0 per effettuare lo store dell'activity su DB 
    this.newRowConsuntivo.id_utente = this.userSelected._id.toString();
    this.newRowConsuntivo.nome_cliente = this.lst_clienti.find(x => x.value == this.newRowConsuntivo.id_cliente).label;
    this.newRowConsuntivo.nome_ambito = this.lst_ambiti.find(x => x.value == this.newRowConsuntivo.id_ambito).label;
    this.newRowConsuntivo.nome_macro_area = this.lst_aree.find(x => x.value == this.newRowConsuntivo.id_macro_area).label;
    this.newRowConsuntivo.nome_attivita = this.lst_attivita.find(x => x.value == this.newRowConsuntivo.id_attivita).label;
    this.newRowConsuntivo.nome_tipo_deliverable = this.lst_deliverable.find(x => x.value == this.newRowConsuntivo.id_tipo_deliverable).label;
    this.newRowConsuntivo.ore = 0;


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

  private refreshMonthList() {
    this.newMonthOpened.emit();
  }

  private addConsuntivo() {
    this.consuntivazioneService.addConsuntivo(this.newRowConsuntivo).subscribe
      (obj => {
        var newCons: any = JSON.parse(JSON.stringify(obj));

        //inizializzo la nuova riga con 0 ore su tutti i gg 
        this.cloneConsuntivoField(this.newRowConsuntivo, this.blankConsuntivo);
        this.blankConsuntivo.ore = 0;
        this.blankConsuntivo.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, 1, 1, 0, 1, 0);
        //inizializzo la table
        for (let i = 0; i < this.nDays; i++) {
          var blankItem = JSON.parse(JSON.stringify(this.blankConsuntivo));
          blankItem.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, i + 1, 1, 0, 1, 0);
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
    this.lst_attivita_clone = [];
    this.filtraAttivitaCombo(true, r.id_tipo_deliverable, r.id_cliente, { label: r.nome_attivita, value: r.id_attivita });
    this.lst_deliverable_clone = [];
    this.filtraDeliverableCombo(r.id_attivita, { label: r.nome_tipo_deliverable, value: r.id_tipo_deliverable });
    r.isEditable = true;
    r.note.forEach(element => {
      if (element.note != null)
        this.noteConsuntivo = r.note;
    });
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
    var nuovaNota = editRowConsuntivo.note;
    var consuntiviToAdd: Consuntivo[] = new Array<Consuntivo>();

    for (let i = 0; i < this.nDays; i++) {
      if (editRowConsuntivo[i]._id != null || editRowConsuntivo[i].ore > 0) {
        editRowConsuntivo[i].note = nuovaNota;
        consuntiviToAdd.push(editRowConsuntivo[i]);
      }
    }

    if (consuntiviToAdd.length > 0) {
      this.consuntivazioneService
        .addUpdateConsuntivi(consuntiviToAdd)
        .subscribe(obj => {
          console.log(obj.msg);
        },
        err => alert(err)
        );
    }

    this.lst_attivita_clone = [];
    this.lst_deliverable_clone = [];
    this.noteConsuntivo = null;
    editRowConsuntivo.isEditable = false;
  }

  private abortEdit(r, i) {
    //TODO: logica di annullo modifiche (annullo modifiche parziali e ripristino riga precedente)
    this.lst_attivita_clone = [];
    this.lst_deliverable_clone = [];
    r.isEditable = false;
  }

  //DELETE ROW
  private delete(r, index) {
    var consuntivoTrovatoIndex = this.consuntivi.findIndex(i => i.id_utente == r.id_utente && i.id_macro_area == r.id_macro_area && i.id_ambito == r.id_ambito && i.id_attivita == r.id_attivita && i.id_tipo_deliverable == r.id_tipo_deliverable);

    var dataInizio = new Date(this.yearSelected, this.monthSelected - 1, 1);
    var dataFine = new Date(this.yearSelected, this.monthSelected, 0);
    console.log('/tcf/api/consuntivoController/delConsuntiviUtente/' + this.monthSelected.toString() + '/' + this.yearSelected.toString() + '/' + r.id_utente + '/' + r.id_macro_area + '/' + r.id_ambito + '/' + r.id_attivita + '/' + r.id_tipo_deliverable)
    this.confirmationService.confirm({
      message: "Sei sicuro di voler eliminare '" + r.nome_attivita + "' ?",
      header: 'Elimina consuntivo',
      icon: 'fa fa-trash',
      accept: () => {
        this.consuntivazioneService.deleteConsuntivi(dataInizio,
          dataFine,
          r.id_utente,
          r.id_macro_area,
          r.id_ambito,
          r.id_attivita,
          r.id_tipo_deliverable).subscribe(msg => {
            this.consuntivi.splice(consuntivoTrovatoIndex, 1);
            this.consuntivi = JSON.parse(JSON.stringify(this.consuntivi)); //deepcopy
          });
      }
    });

    if (index == 0 && !(this.consuntivi.length > 0)) {
      var meseConsuntivo = new MeseConsuntivo();
      meseConsuntivo.anno_consuntivo = this.yearSelected.toString();
      meseConsuntivo.mese_consuntivo = this.monthSelected.toString();
      meseConsuntivo.id_utente = this.userSelected._id.toString();
      this.meseConsuntivoService.deleteMeseConsuntivo(meseConsuntivo).subscribe(obj => {
        this.refreshMonthList();
      })
    }

  }

  //UTILITY
  private daysInMonth(month, year) {
    return new Date(year, month, 1).getUTCDate();
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
    consuntivo.data_consuntivo = new Date(this.yearSelected, this.monthSelected - 1, 1, 1, 0, 1, 0);
    consuntivo.note = null;
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
    consuntivoTarget.note = consuntivoSource.note;
  }

  /*il form group non ha di per se un metodo per verificare se sul form è stato fatto il submit*/
  public checkForm(form) {
    this.formSubmitted = true;
    return form.valid;
  }

  private selectFromCliente(componentname) {
    var selCriteria;
    selCriteria = new Object();
    selCriteria.id_cliente = this.newRowConsuntivo.id_cliente;
    selCriteria.id_ambito = this.newRowConsuntivo.id_ambito;
    selCriteria.id_macro_area = this.newRowConsuntivo.id_macro_area;
    switch (componentname) {
      case 'attivita':
        this.lst_attivita_clone = [];
        this.filtraAttivitaComboPerCliente(selCriteria.id_cliente, selCriteria.id_ambito, selCriteria.id_macro_area);
        break;
      case 'ambito':
        this.consuntivoForm.reset();
        this.resetConsuntivo(this.newRowConsuntivo);
        this.newRowConsuntivo.id_cliente = selCriteria.id_cliente;
        this.lst_ambiti = [];
        this.lst_attivita_clone = [];
        let ambitiCliente: any[] = this.clienti.find(x => x._id == this.newRowConsuntivo.id_cliente).ambiti;

        this.ambiti.forEach(ambito => {
          let elem: SelectItem = ambitiCliente.find(x => x.id_ambito == ambito.value);
          if (elem != null)
            this.lst_ambiti.push({ label: ambito.label, value: ambito.value })
        });
        break;
    }
  }

  public isDisabled(componentName): boolean {
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

  public isValid(componentName: string) {
    if ((this.consuntivoForm.get(componentName).touched || this.formSubmitted) && this.consuntivoForm.get(componentName).errors)
      return "#a94442";
    else
      return "#898989"; //#d6d6d6
  }

  public calculateGroupTotal(col: number) {
    let total = 0;
    if (this.consuntivi) {
      for (let cons of this.consuntivi) {
        if (cons[col].ore != null) {
          total += cons[col].ore;
        }
      }
    }

    return total;
  }


  private filtraAttivitaCombo(isEdit, idDeliverable, idCliente, editedObject) {
    var attivitaTrovata = null;

    this.lst_attivita.forEach(elements => {
      if (this.consuntivi != null)
        attivitaTrovata = null;//this.consuntivi.find(x => x.id_attivita == elements.value && x.id_tipo_deliverable == idDeliverable)
      if (attivitaTrovata == null)
        if (isEdit) {
          if ((this.attivitaList.find(x => x.id_cliente == idCliente && x._id == elements.value) != undefined))
            this.lst_attivita_clone.push(elements);
        }
        else
          this.lst_attivita_clone.push(elements);
    });

  }

  private filtraAttivitaComboPerCliente(idCliente, idAmbito, idMacroArea) {
    var attivitaTrovata = null;
    this.attivitaList.forEach(attivita => {
      if (attivita.id_cliente == idCliente &&
        attivita.id_ambito == idAmbito &&
        attivita.id_macro_area == idMacroArea)
        this.lst_attivita_clone.push({ label: attivita.nome_attivita, value: attivita._id });
    });

  }

  private filtraDeliverableCombo(idAttivita, editedObject) {

    var deliverableTrovata = {};

    var macroAreaType = "standard";
    this.lst_aree.forEach( macroArea =>{
      if(macroArea.value == this.newRowConsuntivo.id_macro_area && macroArea.label == 'Manutenzione')
        macroAreaType = "AM"
    });

    if(macroAreaType != "AM")
      this.getDeliverableList(idAttivita,editedObject); 

    if(macroAreaType == "AM")
      this.getDeliverableForAM(idAttivita,editedObject);  
  }

  private showNote(row, index) {
    this.displayNote = true;
    this.noteConsuntivo = row.note;
    this.noteIndex = index;
    if (row.isEditable) {
      this.isNoteEditable = true;
    } else {
      this.isNoteEditable = false;
    }
  }

}
