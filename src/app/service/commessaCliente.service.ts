import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { CommessaCliente } from '../model/commessaCliente';
import 'rxjs/add/operator/map';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

@Injectable()
export class CommessaClienteService {

  constructor(private http:Http) { }

  @beforeMethod(LogAspect.log)
  getCommesse(){
  	return this.http.get('/tcf/api/commessaClienteController/CRUD')
  		.map(res=> res.json());
  }
  
  @beforeMethod(LogAspect.log)
  getCommessaClienteByUser(clienteCriteria){
  	return this.http.get('/tcf/api/commessaClienteController/CRUD?criteria='+JSON.stringify({id_cliente:{$in:clienteCriteria}}))
  		.map(res=> res.json());
  }

  @beforeMethod(LogAspect.log)
  getCommessaWithCriteria(idParam){
  	return this.http.get('/tcf/api/commessaClienteController/CRUD?criteria='+JSON.stringify(idParam))
  		.map(res=> res.json());
  }

  @beforeMethod(LogAspect.log)
  addCommessaCliente(commessaParam : CommessaCliente){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/commessaClienteController/addOrUpdateCommessaCliente/', commessaParam, {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  deleteCommessaCliente(criteria){
  	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.delete('/tcf/api/commessaClienteController/CRUD?criteria='+JSON.stringify(criteria), {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  updateCommessaCliente(commessaParam, criteria){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/commessaClienteController/addOrUpdateCommessaCliente', commessaParam, {headers:headers})
  		.map(res => res.json());
  }
}