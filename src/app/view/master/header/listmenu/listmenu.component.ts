import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';


@Component({
    selector: "list-menu",
    templateUrl: 'listmenu.component.html',
    styleUrls: ['listmenu.component.css'],
    providers: []
})
export class ListMenuComponent{
    @Input() 
    userLogged: any = {};
    

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {
   
    }

    public onMenuClick(){
        if ($('#listMenu').hasClass('deactive')) {
            $('#listMenu').removeClass('deactive').addClass('active');
            $('#listMenu').fadeTo( "slow", 1 ).css('display', 'block');
        } else if ($('#listMenu').hasClass('active')) {
            $('#listMenu').removeClass('active').addClass('deactive');
            $('#listMenu').fadeTo( "slow", 0 ).css('display', 'none');
        }
    }
    
    public logout(){
		this.router.navigate(['/login']);
    }

    public navtoChangeEmail(){
        this.onMenuClick();
        this.router.navigateByUrl('userChangeEmail')
    }

    public navtoChangePwd(){
        this.onMenuClick();
        this.router.navigateByUrl('userChangePwd')
    }

}