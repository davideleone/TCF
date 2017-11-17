import {Component, Input} from '@angular/core';

@Component({
    selector: "tipo-utente",
    templateUrl: 'tipoUtente.component.html',
    styleUrls: ['tipoUtente.component.css'],
    providers: []
})

export class TipoUtenteComponent{
    @Input() maxUserProfile : string;
}