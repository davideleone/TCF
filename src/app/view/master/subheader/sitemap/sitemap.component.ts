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

    ngOnChanges(){
        if(this.menuSelected == null)
            this.menuSelected = 'Home';
    }
}