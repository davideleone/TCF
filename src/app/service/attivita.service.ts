import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';
import { Attivita } from '../model/attivita';


@Injectable()
export class AttivitaService {

  constructor(private http:Http) { }

  //retrieving ActivityService
	@beforeMethod(LogAspect.log)
  getAttivita(){
  	return this.http.get('/tcf/api/attivitaController/attivitaAll')
  		.map(res=> res.json());
  }

  @beforeMethod(LogAspect.log)
  getAttivitaByUser(clienteCriteria : string[]){
  	return this.http.get('/tcf/api/attivitaController/CRUD?criteria='+JSON.stringify({id_cliente:{$in:clienteCriteria}}))
  		.map(res=> res.json());
  }
  
  @beforeMethod(LogAspect.log)
  /*addAttivita(attivitaParam : Attivita){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/attivitaController/CRUD/', attivitaParam, {headers:headers})
  		.map(res => res.json());
  }*/


  @beforeMethod(LogAspect.log)
  addAttivita(attivitaParam : Attivita){
  	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/attivitaController/attivita', attivitaParam, {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  deleteAttivita(criteria){
  	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.delete('/tcf/api/attivitaController/CRUD?criteria='+JSON.stringify(criteria), {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  updateAttivita(attivitaParam, criteria){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.put('/tcf/api/attivitaController/CRUD/?criteria='+JSON.stringify(criteria), attivitaParam, {headers:headers})
  		.map(res => res.json());
  }
  
  @beforeMethod(LogAspect.log)
  getAttivitaWithCriteria(criteria){
  	return this.http.get('/tcf/api/attivitaController/CRUD?criteria='+JSON.stringify(criteria))
  		.map(res=> res.json());
  }
}
