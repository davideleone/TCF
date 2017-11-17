import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { UserService } from '../../../service/user.service';
import { User } from '../../../model/user';

@Component({
    selector: "subheader",
    templateUrl: 'subheader.component.html',
    styleUrls: ['subheader.component.css'],
    providers: [UserService]
})

export class SubHeaderComponent{
    @Input() userLogged: User;
    @Input() menuSelected : any;
    @Input() maxUserProfile : string;
}