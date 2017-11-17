import { Component, OnInit } from '@angular/core';
import {UserService} from '../../../service/user.service';
import {User} from '../../../model/user';
import {AuthenticationService} from '../../../service/authentication.service';

@Component({
  selector: 'change-email',
  templateUrl: './changeemail.component.html',
  styleUrls: ['./changeemail.component.css'],
  providers: [UserService]
})
export class ChangeEmailComponent implements OnInit {
  userLogged: User;
  model: any = {};


  constructor(private authenticationService : AuthenticationService, private userService : UserService){
    this.authenticationService.user$.subscribe(user => { this.userLogged = user });

  }


  ngOnInit() {
  }

  changeUserEmail(){
    console.log('userLogged.id:'+ this.userLogged._id);
    this.userService.changeUserEmail(this.userLogged._id, this.userLogged.email).subscribe(
      data => {
        console.log('email successfully changed');   
        alert('Email modificata correttamente');
           
      },
      error => {
        alert('Errore modifica email');
        console.log('error on email change');

      });
  }

}
