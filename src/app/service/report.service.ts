import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

@Injectable()
export class ReportService {

  constructor(private http:Http) { }

  //retrieving file to download
  @beforeMethod(LogAspect.log)
  getReportistica(reportParams){
    var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/reportisticaController/download', reportParams, {headers:headers})
  		.map(res=> res.json());
  }

}
