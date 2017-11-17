import { Component, Input, OnInit, AfterViewInit, EventEmitter, Output } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { MenuService } from '../../../service/menu.service';
import { User } from '../../../model/user';

@Component({
    selector: "leftsidebar",
    templateUrl: 'leftsidebar.component.html',
    styleUrls: ['leftsidebar.component.css'],
    providers: [MenuService]
})

export class LeftsideBarComponent implements OnInit {

    menuEntries: any;
    selectedMenu: any;
    @Output() menuSelected = new EventEmitter();
    @Input() maxUserProfile : string;
    @Input() userLogged : User;

    constructor(private menuService: MenuService) {
    }


    ngOnInit() { //DA GESTIRE CON ANGULAR2
        // $('.btnConsuntivazione').addClass('active');
        // $('.subSection').hide();

        // $('.consuntivazioneContainer').show();
        // $('.amministrazioneContainer').hide();
        // $('.reportisticaContainer').hide();

        // $('.btnConsuntivazione').on('click', function() {
        //     if ($('.navigation').hasClass('active')) {
        //         $('.navigation').removeClass('active');
        //     }
        //     $(this).addClass('active');
        //     $('.consuntivazione').fadeIn().show();
        //     $('.consuntivazioneContainer').fadeIn().show();
        //     $('.amministrazione').hide();
        //     $('.amministrazioneContainer').hide();
        //     $('.reportistica').hide();
        //     $('.reportisticaContainer').hide();

        //     $('.subSection').slideUp();
        // });
        // $('.btnAmministrazione').on('click', function() {
        //     if ($('.navigation').hasClass('active')) {
        //         $('.navigation').removeClass('active');
        //     }
        //     $(this).addClass('active');
        //     $('.consuntivazione').hide();
        //     $('.consuntivazioneContainer').hide();
        //     $('.amministrazione').fadeIn().show();
        //     $('.amministrazioneContainer').fadeIn().show();
        //     $('.reportistica').hide();
        //     $('.reportisticaContainer').hide();

        //     $('.subSection').slideDown();
        // });
        // $('.btnReportistica').on('click', function() {
        //     if ($('.navigation').hasClass('active')) {
        //         $('.navigation').removeClass('active');
        //     }
        //     $(this).addClass('active');
        //     $('.consuntivazione').hide();
        //     $('.consuntivazioneContainer').hide();
        //     $('.amministrazione').hide();
        //     $('.amministrazioneContainer').hide();
        //     $('.reportistica').fadeIn().show();
        //     $('.reportisticaContaia te buona er').fadeIn().show();

        //     $('.subSection').slideUp();
        // });

        $('.sidebarToggle').on('click', function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active').hide().fadeIn().addClass('deactive');
                $('.leftSidebar').removeClass('active').hide().fadeIn().addClass('deactive');
                $('.rightSidebar').removeClass('deactive').hide().fadeIn().addClass('active');
            } else if ($(this).hasClass('deactive')) {
                $(this).removeClass('deactive').hide().fadeIn().addClass('active');
                $('.leftSidebar').removeClass('deactive').hide().fadeIn().addClass('active');
                $('.rightSidebar').removeClass('active').hide().fadeIn().addClass('deactive');
            }
        });

        this.menuService.getMenu(this.userLogged._id).subscribe(
            menulist => this.menuEntries = menulist,
            error => alert(error)
        );
    }

    selectMenu(event, item, children, flag) {
        
        var target = event.target || event.srcElement || event.currentTarget;
        var menuElement = target.closest("li");
        var menu = this.selectedMenu != null ? this.selectedMenu.indexOf(" - ") == -1 ? this.selectedMenu : this.selectedMenu.split(" - ")[0] : null;
        var menuPassed = item.indexOf(" - ") == -1 ? item : item.split(" - ")[0];
        
        /*Se non si fa redirect, non si cambia il focus sulla voce di sottomenu*/
        if (this.selectedMenu != item && this.selectedMenu != null)
            $(".subSection").children("li").removeClass('active').addClass('deactive');
        
        /*Se non cambio voce di menu, non cambio il focus*/
        if (menu != menuPassed && menu != null){
            $(".navigation").each(function (index) {
                //$('.navigation').removeClass('active').addClass('deactive');
                $(this).children("ul").slideUp(500);
            });
        }
            

        this.selectedMenu = item;


        if (flag) { // menu padre
            //$(this).addClass('active');
            if (this.selectedMenu) {
                $(menuElement).children("ul").slideDown(500);
            } else {
                $(menuElement).children("ul").slideUp(500);
            }
        }
        else { //sottomenu
            $(menuElement).addClass('active');
        }

        if (children == 0) {
            this.menuSelected.emit(this.selectedMenu);
        }
    }

    @Input()
    set ready(isReady: boolean) {
        if (isReady) {
            $('.subSection').hide();
        }
    }

    isActive(item) {
        if (this.selectedMenu != null && this.selectedMenu.indexOf(" - ") != -1) //contiene la stringa - ? Se si, splitta
            this.selectedMenu = this.selectedMenu.split(" - ")[0];

        return this.selectedMenu === item;
    }

    isVisible(item){
        if(this.maxUserProfile == 'Consuntivatore' && !this.userLogged.isAdmin)
            return item == 'Consuntivazione';
        else
            return true;
    }

}