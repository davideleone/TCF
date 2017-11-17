import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { User } from '../../../model/user';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';

@Component({
  selector: 'user-detail',
  templateUrl: './userDetail.component.html',
  styleUrls: ['./userDetail.component.css'],
  providers: []
})

export class UserDetailComponent implements OnInit{

  @Input() userLogged: User;
  @Input() userSelected : User;
  @Input() maxUserLoggedProfile : string;
  @Output() userChanged = new EventEmitter();
  consuntivatore : boolean;
  backToMonthEvent : boolean = false;
  monthSelected : Number;
  yearSelected : Number;
  yearSelection : boolean;

  ngOnInit(){
    this.consuntivatore = this.isConsuntivatore();
  }

  selectMonth($monthParams){
    this.monthSelected = $monthParams.monthParam;
    this.yearSelected = $monthParams.year;
    this.backToMonthEvent = false;
    this.yearSelection = false;
  }

  selectYear($event){
    this.yearSelection = true;
  }

  backToMonth($event){
    this.monthSelected = null;
    this.yearSelected = null;
    this.backToMonthEvent = true;
  }

  changeUser(){
    this.userChanged.emit();
  }

  isConsuntivatore() : boolean {
    return this.maxUserLoggedProfile == 'Consuntivatore' ? true : false;
  }
}
