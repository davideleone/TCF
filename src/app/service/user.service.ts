import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import {User} from '../model/user';
import 'rxjs/add/operator/map';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

@Injectable()
export class UserService {

  constructor(private http:Http) { }

  //retrieving UserService
  @beforeMethod(LogAspect.log)
  getUsers(){
  	return this.http.get('/tcf/api/userController/users')
  		.map(res=> res.json());
  }

  // //add user
  // @beforeMethod(LogAspect.log)
  // addUser(newUser){
  // 	var headers = new Headers();
  // 	headers.append('Content-Type', 'application/json');
  // 	return this.http.post('/tcf/api/userController/CRUD', newUser, {headers:headers})
  // 		.map(res => res.json());
  // }

  @beforeMethod(LogAspect.log)
  deleteUser(criteria){
  	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.delete('/tcf/api/userController/CRUD?criteria='+JSON.stringify(criteria), {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  insOrUpdUser(userParam){
  	var headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('/tcf/api/userController/insOrUpdUser/', userParam, {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  changeUserEmail(username:string, newEmail:string){
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var bodyparams = {username:username, newEmail:newEmail}
  	return this.http.post('/tcf/api/userController/userChangeEmail', bodyparams, {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  changeUserPwd(userLogged: User, oldPwd:string, newPwd:string){
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var bodyparams = {userLogged: userLogged, oldPwd:oldPwd, newPwd:newPwd}
  	return this.http.post('/tcf/api/userController/userChangePwd', bodyparams, {headers:headers})
  		.map(res => res.json());
  }

  @beforeMethod(LogAspect.log)
  getUsersByManager(userLogged){
  	return this.http.get('/tcf/api/userController/userByManager/' + userLogged + "/")
    .map(res => res.json()); 
  }
}
