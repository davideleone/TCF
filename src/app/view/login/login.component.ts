import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { AuthenticationService } from '../../service/authentication.service';

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css'],
    providers: []
})

export class LoginComponent implements OnInit {
    model: any = {};
    loading = false; 
    returnUrl: string;
    saveWidth :any;
    /*@ViewChild('loginSliding') 
    private loginSliding: ElementRef;
    
*/
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
    ) {
   
    }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();
        
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        
        // centro il pannellino di login mettendo la rightSidebar a 100%, 
        // in onDestroy la riporto alla dimensione precedente
       //this.saveWidth = $('.rightSidebar').css("width");
        //$('.rightSidebar').css("width","100%");

        var staticPanel = $('.loginStatic');
        var slidingPanel = $('.loginSliding');
        
        var signinBtn = staticPanel.find('.btn.signin');
        var resetBtn = staticPanel.find('.btn.reset');
        
        var signinContent = slidingPanel.find('.loginContent.signin');
        
        var resetContent = slidingPanel.find('.loginContent.reset');
    
        signinBtn.on('click', function() {
            $('.loginContent.success').hide();
            resetContent.hide('fast');
            signinContent.show('fast');
            slidingPanel.animate({
                'left': '4%'
            }, 550, 'easeInOutBack');
        });
    
        resetBtn.on('click', function() {
            $('.loginContent.success').hide();
            signinContent.hide('fast');
            resetContent.show('fast');
            slidingPanel.animate({
                'left': '46%'
            }, 550, 'easeInOutBack');
        });
    
        $('.request').on('click', function() {
            $('.loginContent.reset').hide();
            $('.loginContent.success').slideToggle('fast');
            $('.reset').addClass('disableRequest');
        });

    }   


    login() {
        this.loading = true;
        this.authenticationService.login(this.model.username, this.model.password)
            .subscribe(
            data => {
                this.loading = false;
                this.router.navigate([this.returnUrl]);
            },
            error => {
                alert("Errore di Login: " ||  error);
                this.loading = false;
            });

            
    }

    ngOnDestroy(){
        //$('.rightSidebar').css("width",this.saveWidth);
    }
}