import { Component, OnInit } from '@angular/core';
import {UserService} from '../../service/user.service';
import {User} from '../../model/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService]
})
export class UsersComponent implements OnInit {
  users: User[];
  user: User;
  model: any = {};


  constructor(private userService : UserService) { }

  addUser(){
  	const newUser = {
  		_id:  this.model.username,
      id_sede: this.model.idSede,
      desc_sede:this.model.desc_sede,
      password:this.model.password,
      cognome:this.model.cognome,
      nome:this.model.nome,
      email: this.model.email,
      data_inizio_validita: this.model.data_inizio_validita,
      data_fine_validita:this.model.data_fine_validita,
      clienti: this.model.clienti,
      isAdmin: this.model.isAdmin,
  	}
  	this.userService.addUser(newUser).subscribe(user => {
      this.model = {};
  		this.updateUserList();
  	})
  }

  ngOnInit() {
  	this.updateUserList();
  }

  updateUserList(){
  	this.userService.getUsers().subscribe( users => this.users = users);
  }
}
