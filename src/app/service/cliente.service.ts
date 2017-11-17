import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import {User} from '../model/user';
import 'rxjs/add/operator/map';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

@Injectable()
export class ClienteService {

  constructor(private http:Http) { }

  @beforeMethod(LogAspect.log)
  getClienti(){
  	return this.http.get('/tcf/api/clienteController/CRUD')
  		.map(res=> res.json());
  }

  @beforeMethod(LogAspect.log)//TODO Retrieve on server side the array of cliente ambiti
  getAmbitiCliente(criteria){
  	return this.http.get('/tcf/api/clienteController/clienti')
  		.map(res=> res.json());
  }



  

  

}
