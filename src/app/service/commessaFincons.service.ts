import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { CommessaFincons } from '../model/commessaFincons';
import 'rxjs/add/operator/map';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

@Injectable()
export class CommessaFinconsService {

  constructor(private http:Http) { }

  @beforeMethod(LogAspect.log)
  getCommesse(){
  	return this.http.get('/tcf/api/commessaFinconsController/CRUD')
  		.map(res=> res.json());
  }

  @beforeMethod(LogAspect.log)
  getCommessaFinconsWithCriteria(idParam){
  	return this.http.get('/tcf/api/commessaFinconsController/CRUD?criteria='+JSON.stringify(idParam))
  		.map(res=> res.json());
  }

  /*@beforeMethod(LogAspect.log)
  getClienteByCommessa(idParam){
  	return this.http.get('/tcf/api/commessaFinconsController/CRUD?criteria='+JSON.stringify(idParam))
  		.map(res=> res.json());
  }*/

  @beforeMethod(LogAspect.log)
  addcommessaFincons(commessaParam : CommessaFincons){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/commessaFinconsController/CRUD/', commessaParam, {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  deletecommessaFincons(criteria){
  	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.delete('/tcf/api/commessaFinconsController/CRUD?criteria='+JSON.stringify(criteria), {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  updatecommessaFincons(commessaParam, criteria){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.put('/tcf/api/commessaFinconsController/CRUD/?criteria='+JSON.stringify(criteria), commessaParam, {headers:headers})
  		.map(res => res.json());
  }
}