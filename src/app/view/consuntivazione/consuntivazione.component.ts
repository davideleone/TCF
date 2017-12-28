import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { User } from '../../model/user';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { AuthenticationService } from '../../service/authentication.service';

@Component({
  selector: 'app-consuntivazione',
  templateUrl: './consuntivazione.component.html',
  styleUrls: ['./consuntivazione.component.css'],
  providers: []
})

export class ConsuntivazioneComponent implements OnInit {

  readonly adminSystem: string = "Amministratore di sistema";
  readonly adminProject: string = "Amministratore di progetto";
  readonly reporter: string = "Consuntivatore";

  userSelected: User;
  userLogged: User;
  selected: boolean = false;
  userList;
  userDetail;
  maxUserLoggedProfile;

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.user$.subscribe(user => {
      this.userLogged = user;
      if(user != null)
        this.maxUserLoggedProfile = this.getMaxUserProfile(user);
    });
  }

  ngOnInit() {
    this.userList = $('.selectUser');
    this.userDetail = $('.userDetail');
    if (this.maxUserLoggedProfile == 'Consuntivatore') {
      this.userSelected = this.userLogged;
      this.userList.hide();
      this.userDetail.show();
    }
    else {
      this.userList.show();
      this.userDetail.hide();
    }
  }

  selectUser(userParam) {
    this.userSelected = userParam;
    this.userList.slideUp().fadeOut().hide('slow');
    this.userDetail.fadeIn().show('slow');
  }

  changeUser(event) {
    this.userSelected = null;
    this.userDetail.slideDown().fadeOut().hide('slow');
    this.userList.fadeIn().show('slow');
  }

  getMaxUserProfile(userLogged: User): string {
    var profiles = Array<string>();

    if (userLogged.clienti != null) {
      for (let i = 0; i < userLogged.clienti.length; i++)
        profiles.push(userLogged.clienti[i].profilo);

      return (profiles.includes('AS') || userLogged.isAdmin) ? this.adminSystem : profiles.includes('AP') ? this.adminProject : this.reporter;

    } else {
      return this.reporter;
    }

  }

}
