import { Component, OnInit } from '@angular/core';
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../../helpers/logAspect';
import { Chart } from "chart.js";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: []
})

export class HomeComponent {
  data: any;
  
      constructor() {
          this.data = {
              labels: ['ITAS','Zurich','DoBank'],
              datasets: [
                  {
                      data: [300, 50, 100 ],
                      backgroundColor: [
                          "#b10022",
                          "#36A2EB",
                          "#FFCE56"
                      ],
                      hoverBackgroundColor: [
                          "#FF6384",
                          "#36A2EB",
                          "#FFCE56"
                      ]
                  }]    
              };
      }

	@beforeMethod(LogAspect.log)
  private log(){
    //nothing
  }


}
