import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: "sitemap",
    templateUrl: 'sitemap.component.html',
    styleUrls: ['sitemap.component.css'],
    providers: []
})

export class SitemapComponent implements OnChanges{
    @Input() userLogged : any;
    @Input() menuSelected : any;

    ngOnInit(){
    }
    
    ngOnChanges(){
        /*Da risistemare con implementazione cache*/
        if(this.menuSelected == null) 
            if(localStorage.getItem("currentMenu") == null)
                this.menuSelected = 'Home';
            else
                this.menuSelected = localStorage.getItem("currentMenu"); 
        else
            localStorage.setItem("currentMenu", this.menuSelected);
    }
}