import { Component, OnInit } from '@angular/core';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-tab',
  templateUrl: './bottom-tab.component.html',
  styleUrls: ['./bottom-tab.component.scss'],
})
export class BottomTabComponent implements OnInit {

  tabActiveStatus: Array<any> = ['true', 'false', 'false','false'];
  number: any;

  constructor(
    private helper: HelpermethodsService,
    private router: Router,
  ) {}

  ngOnInit() {
    // this.onClickBottomTab(0);
  }



  onClickBottomTab(num) {
    this.number = num;
    // this.tabActiveStatus = ['false', 'false', 'false','false'];

    this.tabActiveStatus.forEach((data, index) => {
      if(index == num) {
        this.tabActiveStatus[index] = 'true';
      }else{
        this.tabActiveStatus[index] = 'false';
      }
    })  
    
    let encryptedData = this.helper.encryptData(this.tabActiveStatus);
    localStorage.setItem('active_status', encryptedData);
    // let istracking = localStorage.getItem('istrackstarted');

    // if(num == 0){
    //   if(istracking){
    //     this.router.navigate(['/track-vendor']);
    //   }else{
    //     this.router.navigate(['/category']);
    //   }
    // }
    
  }




  getActiveStatus() {
    // console.log('active data :.........', this.tabActiveStatus);    
    // console.log('number :.........', this.number); 
    let activeStatus = localStorage.getItem('active_status');   
    return this.helper.decryptData(activeStatus);  
  }

}
