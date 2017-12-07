import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Cliente} from '../model/cliente';
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


  @beforeMethod(LogAspect.log)
  addCliente(clienteParam : Cliente){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/clienteController/CRUD/', clienteParam, {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  deleteCliente(criteria){
  	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.delete('/tcf/api/clienteController/CRUD?criteria='+JSON.stringify(criteria), {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  updateCliente(commessaParam, criteria){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.put('/tcf/api/clienteController/CRUD/?criteria='+JSON.stringify(criteria), commessaParam, {headers:headers})
  		.map(res => res.json());
  }


  

  

}
