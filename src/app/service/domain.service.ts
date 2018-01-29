import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Router} from '@angular/router';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

import 'rxjs/add/operator/map'

@Injectable()
export class DomainService {

     constructor(
        private http: Http,
        private router: Router
        ) {            
    }
   

    //DOMAIN SECTION
    @beforeMethod(LogAspect.log)
    getTipiDeliverable() {
        return this.getGenericCall("/FTC/COMMON/lst_deliverable");      
    }

    @beforeMethod(LogAspect.log)
    getTipiDeliverableAM() {
        return this.getGenericCall("/FTC/COMMON/lst_deliverable_AM");      
    }

    @beforeMethod(LogAspect.log)
    getAmbiti() {
        return this.getGenericCall("/FTC/COMMON/lst_ambiti");               
    }

    @beforeMethod(LogAspect.log)
    getSedi() {
        return this.getGenericCall("/FTC/COMMON/lst_sedi");               
    }

    @beforeMethod(LogAspect.log)
    getAree() {
        return this.getGenericCall("/FTC/COMMON/lst_aree");               
    }
    
	@beforeMethod(LogAspect.log)
    getGenericCall(domain){
        return this.http.get('/tcf/api/domainController/getDomainList' + domain )
        .map((response: Response) => {
            let domain  = response.json();
            return domain;
        }); 
    }
 
}