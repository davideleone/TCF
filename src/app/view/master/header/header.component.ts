import {Component, Input} from '@angular/core';

@Component({
    selector: "header",
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.css'],
    providers: []
})

export class HeaderComponent{
    @Input() 
    userLogged : any;
}