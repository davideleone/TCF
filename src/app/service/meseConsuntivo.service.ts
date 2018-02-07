import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import {MeseConsuntivo} from '../model/meseConsuntivo';
import 'rxjs/add/operator/map';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

@Injectable()
export class MeseConsuntivoService {

  constructor(private http:Http) { }
  
	@beforeMethod(LogAspect.log)
  getMesiConsuntiviUtente(userId, year){
  	return this.http.get('/tcf/api/meseConsuntivoController/mesiConsuntiviUtente/'+userId+'/'+year)
    .map(res => res.json()); 
  }


    //add Consuntivo
    @beforeMethod(LogAspect.log)
    addMeseConsuntivo(meseConsuntivoParam : MeseConsuntivo){
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      return this.http.post('/tcf/api/meseConsuntivoController/CRUD/', meseConsuntivoParam, {headers:headers})
        .map(res => res.json());
    }

    @beforeMethod(LogAspect.log)
    deleteMeseConsuntivo(meseConsuntivoParam : MeseConsuntivo){
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      return this.http.delete('/tcf/api/meseConsuntivoController/CRUD?criteria='+JSON.stringify(meseConsuntivoParam), {headers:headers})
        .map(res => res.json());
    }

    @beforeMethod(LogAspect.log)
    getMeseConsuntivoCRUD(meseConsuntivoParam : string[]){
      return this.http.get('/tcf/api/meseConsuntivoController/CRUD?criteria='+JSON.stringify(meseConsuntivoParam))
        .map(res=> res.json());
    }

    @beforeMethod(LogAspect.log)
    updateMeseConsuntivo(meseConsuntivoParam, criteria){
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      return this.http.put('/tcf/api/meseConsuntivoController/CRUD/?criteria='+JSON.stringify(criteria), meseConsuntivoParam, {headers:headers})
        .map(res => res.json());
    }


}
