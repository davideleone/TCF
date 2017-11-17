import { Component, OnInit } from '@angular/core';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../../helpers/logAspect';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: []
})

export class HomeComponent {
  constructor(){
    this.log();    
  }

	@beforeMethod(LogAspect.log)
  private log(){
    //nothing
  }

}
