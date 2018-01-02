import { Component, OnInit, Input, EventEmitter, Output, OnChanges, Pipe } from '@angular/core';
import { User } from '../../../../model/user';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { MeseConsuntivo } from '../../../../model/meseConsuntivo';
import { MeseConsuntivoService } from '../../../../service/meseConsuntivo.service';

@Component({
  selector: 'month-list',
  templateUrl: './monthList.component.html',
  styleUrls: ['./monthList.component.css'],
  providers: [MeseConsuntivoService]
})

export class MonthListComponent implements OnChanges, OnInit {
  @Input() userSelected: User;
  @Input() backToMonthEvent: boolean;
  @Input() monthOpened: boolean;
  @Output() monthSelect = new EventEmitter();
  @Output() yearSelect = new EventEmitter();
  todayYear = (new Date()).getFullYear();
  years: number[] = new Array<number>();
  months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  monthsOfUser: MeseConsuntivo[];
  diffYears: number;
  assunzione;
  yearChanged: boolean = false;
  yearOld = null;
  userSelectedOld = null;


  constructor(private meseConsuntivoService: MeseConsuntivoService) {
    /*Mi calcolo la differenza tra l'anno attuale e l'anno di assunzione*/
  }

  ngOnInit() {
    this.yearOld = null;
    this.userSelectedOld = null;
    $('.riassuntoMesiSection p').text('');
    $('.today').val(this.todayYear);
  }

  ngOnChanges() {

    if (this.userSelected._id != this.userSelectedOld) {
      $('.riassuntoMesiSection p').text('');
      $('.today').val(this.todayYear);
      this.openMonthsClone();
      this.userSelectedOld = this.userSelected._id;
      this.years = [];
      this.assunzione = (new Date(this.userSelected.data_inizio_validita)).getFullYear();
      this.diffYears = this.todayYear - this.assunzione;

      for (let i = 0; i <= this.diffYears; i++)
        this.years.push(this.todayYear - i);

      $('.allList').hide();
      this.meseConsuntivoService.getMesiConsuntiviUtente(this.userSelected._id, $('.today').val()).subscribe(months => this.monthsOfUser = months);

    }

    if (this.monthOpened) {
      var comboYear = $('.today').val();
      this.meseConsuntivoService.getMesiConsuntiviUtente(this.userSelected._id, comboYear).subscribe(months => this.monthsOfUser = months);
      this.monthOpened = false;
    }

    if (this.backToMonthEvent) {
      this.openMonthsClone();
      $('.riassuntoMesiSection p').text('');
    }

  }

  /*Gestione click arrow anno*/
  changeDate() {
    $('.allList').slideToggle();
    $('i').toggleClass('active');
  }

  /*Gestione selezione mese da consuntivare per far appare la griglia*/
  selectMonth(monthParam) {
    var year = $('.today').val();
    this.closeMonths();
    $('.riassuntoMesiSection p').text(this.months[monthParam - 1]);
    this.backToMonthEvent = false;
    this.monthSelect.emit({ monthParam, year });
  }

  /*Gestione click dell'anno nella combobox*/
  changeYear(yearParam) {
    //Se seleziono lo stesso anno non chiudo e riapro la lista mesi
    if (yearParam != this.yearOld) {
      this.closeMonths();
      this.openMonthsClone();
      this.yearOld = yearParam;
    }

    $('.today').val(yearParam);
    $('.allList').slideToggle();
    $('i').toggleClass('active');
    $('.riassuntoMesiSection p').text('');
    setTimeout(wait => {
      this.meseConsuntivoService.getMesiConsuntiviUtente(this.userSelected._id, yearParam).subscribe(months => this.monthsOfUser = months);
    }, 400);
    this.yearSelect.emit();
  }

  openMonths() {
    if ($('.toggleRight').hasClass('deactive'))
      $('.toggleRight').removeClass('deactive').addClass('active');
    else
      $('.toggleRight').removeClass('active').addClass('deactive');

    $('.riassuntoMesi ul').slideToggle();

  }

  openMonthsClone() {
    if ($('.toggleRight').hasClass('deactive')) {
      $('.toggleRight').removeClass('deactive').addClass('active');
      $('.riassuntoMesi ul').slideToggle();
    }
  }

  closeMonths() {
    if ($('.toggleRight').hasClass('active')) {
      $('.toggleRight').removeClass('active').addClass('deactive');
      $('.riassuntoMesi ul').slideToggle();
    }
  }

  /*Gestione icona stato del mese*/
  monthStatus(monthParam) {
    var userClass: String = "";
    var monthType: String = "";
    var consuntivo: MeseConsuntivo;

    if (this.monthsOfUser != null) {
      consuntivo = this.monthsOfUser.find(mese => mese.mese_consuntivo == monthParam);
      if (consuntivo != null) {
        switch (consuntivo.nome_stato) {
          case 'Da Verificare':
            userClass = "fa fa-calendar-minus-o";
            break;
          case 'Chiuso':
            userClass = "fa fa-calendar-check-o";
            break;
          case 'Aperto':
            userClass = "fa fa-calendar-plus-o";
            break;
        }
        monthType = consuntivo.nome_stato;
      } else {
        userClass = "fa fa-calendar-o";
        monthType = "Non disponibile";
      }
    }
    return userClass;
  }

  /*Gestione nome stato del mese*/
  setStatus(monthParam) {
    var userClass;
    var monthType: String = "";
    var consuntivo: MeseConsuntivo;

    if (this.monthsOfUser != null)
      consuntivo = this.monthsOfUser.find(mese => mese.mese_consuntivo == monthParam);

    return consuntivo != null ? consuntivo.nome_stato : "Non disponibile";
  }

}
