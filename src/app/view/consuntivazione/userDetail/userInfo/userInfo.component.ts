import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { User } from '../../../../model/user';

@Component({
  selector: 'user-info',
  templateUrl: './userInfo.component.html',
  styleUrls: ['./userInfo.component.css'],
  providers: []
})

export class UserInfoComponent{

 @Input() userSelected: User;
 @Input() isConsuntivatore : boolean;
 @Output() userChanged = new EventEmitter();

  changeUser(){
    this.userChanged.emit();
  }
}
