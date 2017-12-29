import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-easing';
import { AuthenticationService } from '../../service/authentication.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css'],
    providers: [FormBuilder]
})

export class LoginComponent implements OnInit {
    formSubmitted: boolean;
    loginForm: any;
    model: any = {};
    loading = false;
    returnUrl: string;
    saveWidth: any;
    alertMsg : string;
    alertDialog : boolean  = false;
    /*@ViewChild('loginSliding') 
    private loginSliding: ElementRef;
    
*/
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private formBuilder: FormBuilder
    ) {
        this.loginForm = this.formBuilder.group({
            username: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
        });
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

        signinBtn.on('click', function () {
            $('.loginContent.success').hide();
            resetContent.hide('fast');
            signinContent.show('fast');
            slidingPanel.animate({
                'left': '4%'
            }, 550, 'easeInOutBack');
        });

        resetBtn.on('click', function () {
            $('.loginContent.success').hide();
            signinContent.hide('fast');
            resetContent.show('fast');
            slidingPanel.animate({
                'left': '46%'
            }, 550, 'easeInOutBack');
        });

        $('.request').on('click', function () {
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
                this.alertDialog = true;
                this.alertMsg = error;
                this.loading = false;
            });
    }

    ngOnDestroy() {
        //$('.rightSidebar').css("width",this.saveWidth);
    }

    public checkForm(form) {
        this.formSubmitted = true;
        return form.valid;
    }

    public isValid(componentName: string) {
        /*if (this.formSubmitted && this.loginForm.get(componentName).errors)
            return "#a94442";
        else
            return "#898989"; //#d6d6d6*/
    }
}