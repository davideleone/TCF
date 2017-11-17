import { Component, OnInit } from '@angular/core';
import {UserService} from '../../../service/user.service';
import {User} from '../../../model/user';
import {AuthenticationService} from '../../../service/authentication.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './changepwd.component.html',
  styleUrls: ['./changepwd.component.css'],
  providers: [UserService]
})
export class ChangePwdComponent implements OnInit {
  userLogged: User;
  model: any = {};


  constructor(private authenticationService : AuthenticationService, private userService : UserService){
    this.authenticationService.user$.subscribe(user => { this.userLogged = user });
  }


  ngOnInit() {
  }

  changeUserPwd(form: NgForm){
    console.log('userLogged.id:'+ this.userLogged._id);
    if(!this.checkNewPwd()){
      alert('Le nuova password non coincide');
      return;
    }
    if(!this.checkOldPwd()){
      alert('Password attuale non corretta');
      return;
    }
    this.userService.changeUserPwd(this.userLogged, this.model.oldPwd, this.model.newPwd).subscribe(
      data => {
        console.log('pwd successfully changed');   
        alert('Password modificata correttamente');
        form.resetForm();
      },
      error => {
        console.log('error on pwd change');
        var msgToShow = 'Errore modifica password';
        if(error){
          msgToShow += ': ' +error;
        }
        alert(msgToShow);
      });
  }

  private checkNewPwd(){
    return this.model.newPwd == this.model.newPwdConfirm;
  }

  private checkOldPwd(){
    //per il momento questo controllo lo faccio lato server;
    return true;
  }
}
