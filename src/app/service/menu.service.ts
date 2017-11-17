import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Router} from '@angular/router';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

import 'rxjs/add/operator/map'

@Injectable()
export class MenuService {

     constructor(
        private http: Http,
        private router: Router
        ) {            
    }

    //MENU SECTION
    @beforeMethod(LogAspect.log)
    getMenu(userLogged: any) {
        
        return this.http.get('/tcf/api/menuController/getMenuList/' + userLogged )
            .map((response: Response) => {
                let menu = response.json();
                return menu;
            });
    }
 
}