import { Injectable, OnInit, OnChanges, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
//import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';
import {JL} from "jsnlog";

import 'rxjs/add/operator/map'
import { locale } from 'core-js/library/web/timers';

@Injectable()
export class AuthenticationService implements OnInit, OnChanges{
    JL: JL.JSNLog;
    user$ = new BehaviorSubject<any>(this._user$);
    //userLogged =new BehaviorSubject<any>(0);
    //user$ = this.userLogged.asObservable();

    constructor(
        private http: Http,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        @Inject('JSNLOG') JL: JL.JSNLog
        ) {
            this.JL = JL;
    }

    ngOnChanges(){     
        this._user$ = localStorage.getItem('currentUser');
    }

    ngOnInit(){

        
        this.router.events
        .filter((event) => event instanceof NavigationEnd)
        .map(() => this.activatedRoute)
        .map((route) => {
            
            while (route.firstChild) route = route.firstChild;
            return route;
        })
        .filter((route) => route.outlet === 'primary')
        .mergeMap((route) => route.data)
        .subscribe(
        (event) => {
            //JL().info(window.location.pathname);
            if (window.location.pathname == "/login") {
                this.logout();
            } else {
                if(this.user$ == null){
                    this.user$.next(this._user$);
                }
                // user = localStorage.getItem('currentUser');
                // if (this.userLogged != null)
                // this.maxUserProfile = this.getMaxProfile(this.userLogged);
            }
        });
    }

	@beforeMethod(LogAspect.log)
    login(username: string, password: string) {
        return this.http.post('/tcf/api/userController/authenticate', { username: username, password: password })
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let user = response.json();
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    var expirationMS =  30 *60*1000;
		            var record = {value: JSON.stringify(user), timestamp: new Date().getTime() + expirationMS}
                    localStorage.setItem('currentUser', JSON.stringify(record));
                   this._user$ = user;                   
                }
                return this._user$;
            });
    }
	@beforeMethod(LogAspect.log)
    logout() {
        // remove user from local storage to log user out
        //this.userLogged.next(null);
        //this.userLogged = null;
        this.router.navigate(['/login']);
        this._user$ = null;
    }

    set _user$(value: any) {
        //JL().info("set userLogged in LocalSorage");
        try{
            if(value){            
                localStorage.setItem('currentUser', JSON.stringify(value));
            }else{
                localStorage.removeItem('currentUser');
            }
            this.user$.next(value); // this will make sure to tell every subscriber about the change.
        }catch(error){
            console.log(error);
        }
    }
     
      get _user$() {
        //JL().info("get userLogged from LocalStorage");
        

        return JSON.parse(localStorage.getItem('currentUser'));
      }


  /**
   * Reset the password for a user and send it via mail
   *//*
  forgotPassword(token:string, newPassword:string) {
    return this.http.post('/tcf/api/userController/forgotpassword', { email: email});
  }*/
 
}