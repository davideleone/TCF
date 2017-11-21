import { Component, OnInit, Output } from '@angular/core';
import {User} from '../../../model/user';
import {UserService} from '../../../service/user.service';
import { Pipe, PipeTransform, EventEmitter, Input, OnChanges } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';

@Pipe({
  name: 'search'
})

/*Da verifica se opportuno modificare per richiamare il servizio direttamente al type (casistica molti record)*/
export class SearchUser implements PipeTransform {
  public transform(value, keys: string, term: string) {

    if (!term) return value;
    return (value || []).filter((item) => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));

  }
}

@Component({
  selector: 'user-list',
  templateUrl: './userList.component.html',
  styleUrls: ['./userList.component.css'],
  providers: [UserService]
})


export class UserListComponent implements OnChanges{

  users: User[];
  @Input() userLogged : User;
  @Input() maxUserLoggedProfile : string;
  @Input() selected;
  @Output() userSelected = new EventEmitter();

  constructor(private userService : UserService) {
  }

  ngOnChanges(){
    this.getUsers();
  }

  selectUser(userParam){
      this.userSelected.emit(userParam);
  }

  deleteUser(userParam){
    //elimina utente per id
  }

  getUsers(){
    this.userService.getUsersByManager(this.userLogged._id).subscribe( users => this.users = users);
  }

  chooseClass(userParam : User){
    var userClass;
      switch(this.getMaxUserProfile(userParam)){
        case 'AS':
          userClass = "fa fa-user-md";
          break;
        case 'AP':
          userClass = "fa fa-user-plus";
          break;
        case 'CS':
          userClass = "fa fa-user";
          break;
      }
    return userClass;  
  }

  getMaxUserProfile(userLogged : User) : string{
    var profiles = Array<string>();
    
    for(let i=0; i<userLogged.clienti.length; i++)
        profiles.push(userLogged.clienti[i].profilo);

    return profiles.includes('AS') ? "AS" : profiles.includes('AP') ? "AP" : "CS";

  }

  }
