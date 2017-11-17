import { Component, Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { AuthenticationService } from '../../service/authentication.service';
import { User } from '../../model/user';

@Component({
	selector: 'master',
	templateUrl: './master.component.html',
	styleUrls: ['./master.component.css'],
	providers: []
})
@Injectable()
export class MasterComponent {

	userLogged: any;

	readonly adminSystem: string = "Amministratore di sistema";
	readonly adminProject: string = "Amministratore di progetto";
	readonly reporter: string = "Consuntivatore";

	subscription: Subscription;

	menuSelected: any;
	maxUserProfile: string;

	constructor(
		private authenticationService: AuthenticationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
		) {
			
		this.authenticationService.user$.subscribe(user => {			
			if (user != null) {
				this.userLogged = user;
				this.maxUserProfile = this.getMaxProfile(user);
			} else {
				this.userLogged = null;
				this.maxUserProfile = null;
			}
		});
	}


	logout() {
		this.authenticationService.logout();		
	}

	selectMenu(menuParam) {
		this.menuSelected = menuParam;
	}

	getMaxProfile(userLogged: User): string {
		var profiles = Array<string>();

		if(userLogged.isAdmin)
			return this.adminSystem;

		if (userLogged.clienti != null && userLogged.clienti.length>0) {
			for (let i = 0; i < userLogged.clienti.length; i++)
				profiles.push(userLogged.clienti[i].id_profilo);

			return profiles.includes('AS') ? this.adminSystem : profiles.includes('AP') ? this.adminProject : profiles.includes('CS') ? this.reporter : "";
		} else {
			return this.reporter;
		}
	}

}
