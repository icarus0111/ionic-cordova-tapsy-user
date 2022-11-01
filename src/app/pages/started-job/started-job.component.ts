import { Component, OnInit } from '@angular/core';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';

@Component({
  selector: 'app-started-job',
  templateUrl: './started-job.component.html',
  styleUrls: ['./started-job.component.scss'],
})
export class StartedJobComponent implements OnInit {
  acceptVendorData: any;

  constructor(
    private helper: HelpermethodsService
  ) { }

  ngOnInit() {}

  getAcceptVendorData(){
    this.acceptVendorData = this.helper.getAcceptVendorData();   
    if(this.acceptVendorData.status){
      return this.acceptVendorData.data[0];
    }else{
      return null;
    };
  }

}
