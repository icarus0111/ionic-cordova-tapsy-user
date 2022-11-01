import { Component, OnInit, ViewChild } from '@angular/core';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/service/api.service';
import { AlertService } from 'src/app/service/alert.service';
import { NavController, IonInfiniteScroll } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-booking',
  templateUrl: './my-booking.component.html',
  styleUrls: ['./my-booking.component.scss'],
})
export class MyBookingComponent implements OnInit {

  // @ViewChild(IonInfiniteScroll, null) infiniteScroll: IonInfiniteScroll;
  // @ViewChild(IonInfiniteScroll, null) infiniteScroll2: IonInfiniteScroll;
  load_upcoming: boolean = true;
  load_complete: boolean = true;

  tabActiveStatus: Array<any> = ['false', 'true', 'false','false'];
  showLoader: boolean = false;

  activeTab: Array<any> = ['true', 'false']; 
  baseImageUrl: string = environment.baseImageUrl;
  jobsList: Array<any> = [];
  upcomingJobs: Array<any> = [];
  completedJobs: Array<any> = [];

  maxRecord: number = 10; //--- Maximum value show each pagination
  currentPageIndex: number = 1;
  currentPageIndex2: number = 1;

  constructor(
    private router: Router,
    private helper: HelpermethodsService,
    private apiService: ApiService,
    private alert: AlertService,
    private navCtrl: NavController
  ) { }

  ionViewWillEnter() {
    this.getUpcomingJobList();
  }

  ngOnInit() {
    //this.getJobList();
    // this.getUpcomingJobList();

    let encryptedData = this.helper.encryptData(this.tabActiveStatus);
    localStorage.setItem('active_status', encryptedData);
  }

  // ionViewWillEnter() {
  //   this.upcomingJobs = [];
  //   this.currentPageIndex = 1;
  //   this.getUpcomingJobList();
  // }

  onClickTab(num){
    if(num == 0){
      this.activeTab[0] = 'true';
      this.activeTab[1] = 'false';
    }else{
      this.activeTab[0] = 'false';
      this.activeTab[1] = 'true';
    }
  }

  getUpcomingJobList() {
    this.showLoader = true;

    let payload = {
      customer_id: this.helper.checkForUserData().id,
      job_status: 1,
      offset: this.currentPageIndex,
      limit: this.maxRecord
    }

    this.apiService.getLimitJobsListByUser(payload).subscribe(async (data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            this.upcomingJobs = decrypted.data;
            this.upcomingJobs = this.upcomingJobs.filter((item)=>{
              if(item.vendor_id != null){
                item.formatedDate = this.createDateFormat(item.date);
                return item;
              }
            });
            //console.log('this.upcomingJobs: ', this.upcomingJobs);

            //--- Check wheather no of product return is less than maximum record
            //console.log('this.upcomingJobs.length', this.upcomingJobs.length);
              
            if(decrypted.data < this.maxRecord) {
              // this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
              this.load_upcoming = false;
            }

            this.currentPageIndex += 1;

            this.getCompletedJobList();
          } else {
            // const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No upcoming jobs found.');
            // alert.present();

            this.getCompletedJobList();
          }
          this.showLoader = false;
        } else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();

          this.getCompletedJobList();
        }
      } 
    }, async (error) =>{
      this.showLoader = false;
      const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
      alert.present();

      this.getCompletedJobList();
    })
  }

  getCompletedJobList() {
    this.showLoader = true;

    let payload = {
      customer_id: this.helper.checkForUserData().id,
      job_status: 2,
      offset: this.currentPageIndex2,
      limit: this.maxRecord
    }

    this.apiService.getLimitJobsListByUser(payload).subscribe(async (data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            this.completedJobs = decrypted.data;

            //--- Check wheather no of product return is less than maximum record
            console.log('this.completedJobs :..........', this.completedJobs);
            this.completedJobs.forEach((item)=>{
              item.formatedDate = this.createDateFormat(item.date);
            });
            
            if(this.completedJobs.length < this.maxRecord) {
              // this.infiniteScroll2.disabled = !this.infiniteScroll2.disabled;
                this.load_complete = false;
            }

            this.currentPageIndex2 += 1;
          } else {
            // const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No completed jobs found.');
            // alert.present();
          }
          this.showLoader = false;
        } else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();
        }
      } 
    }, async (error) =>{
      this.showLoader = false;
      const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
      alert.present();
    })
  }

  loadUpcomingData(event) {
    console.log('Upcoming data loaded...');
    
    setTimeout(() => {

      //this.showLoader = true;

      let payload = {
        customer_id: this.helper.checkForUserData().id,
        job_status: 1,
        offset: this.currentPageIndex,
        limit: this.maxRecord
      }

      this.apiService.getLimitJobsListByUser(payload).subscribe(async (data: any) => {
        if(data && data.TAP_RES) {
          let decrypted = this.helper.decryptResponceData(data.TAP_RES);

          if(decrypted.status) {
            if(decrypted.data !== null && decrypted.data.length > 0) {
              decrypted.data.forEach(element => {
                
                element.formatedDate = this.createDateFormat(element.date);
               
                this.upcomingJobs.push(element);
              });

              //--- Check wheather no of product return is less than maximum record
              if(decrypted.data.length < this.maxRecord) {
                // this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
                this.load_upcoming = false;
              }

              this.currentPageIndex += 1;
              //console.log('After Loading: ', this.currentPageIndex, this.upcomingJobs);
            } else {
              // const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No upcoming jobs found.');
              // alert.present();
            }
            //this.showLoader = false;
          } else {
            //this.showLoader = false;
            const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
            alert.present();
          }
        } 
      }, async (error) =>{
        //this.showLoader = false;
        const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
        alert.present();
      });

      event.target.complete();
    });
  }

  loadCompleteData(event) {
    console.log('Completed data loaded...');
    
    setTimeout(() => {

      //this.showLoader = true;

      let payload = {
        customer_id: this.helper.checkForUserData().id,
        job_status: 2,
        offset: this.currentPageIndex2,
        limit: this.maxRecord
      }

      this.apiService.getLimitJobsListByUser(payload).subscribe(async (data: any) => {
        if(data && data.TAP_RES) {
          let decrypted = this.helper.decryptResponceData(data.TAP_RES);

          if(decrypted.status) {
            if(decrypted.data !== null && decrypted.data.length > 0) {
              decrypted.data.forEach(element => {
                element.formatedDate = this.createDateFormat(element.date);
                this.completedJobs.push(element);
              });

              //--- Check wheather no of product return is less than maximum record
              if(decrypted.data.length < this.maxRecord) {
                // this.infiniteScroll2.disabled = !this.infiniteScroll2.disabled;
                this.load_complete = false;
              }

              this.currentPageIndex2 += 1;
              //console.log('After Loading: ', this.currentPageIndex2, this.completedJobs);
            } else {
              // const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No upcoming jobs found.');
              // alert.present();
            }
            //this.showLoader = false;
          } else {
            //this.showLoader = false;
            const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
            alert.present();
          }
        } 
      }, async (error) =>{
        //this.showLoader = false;
        const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
        alert.present();
      });

      event.target.complete();
    });
  }

  // Not require from 14-01-2020 as scrolling time dynamic data loaded
  getJobList() {
    this.showLoader = true;

    let payload = {
      customer_id: this.helper.checkForUserData().id
    }

    this.apiService.getAllJobsListByUser(payload).subscribe(async (data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('job list data: ', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            this.jobsList = decrypted.data;
            this.upcomingJobs = this.getUpcomingJobs(this.jobsList);
            this.completedJobs = this.getCompletedJobs(this.jobsList);
          }else {
            this.jobsList = [];
            this.upcomingJobs = [];
            this.completedJobs = [];
            const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No jobs found.');
            alert.present();
          }
          this.showLoader = false;
        }else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();
        }
      } 
    }, async (error) =>{
      this.showLoader = false;
      const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
      alert.present();
    })
  }

  // Not require from 14-01-2020 as scrolling time dynamic data loaded
  getUpcomingJobs(arr: Array<any>){
    return arr.filter(item => {
      if(item.job_status == 1){
        return item;
      }
    })
  }

  // Not require from 14-01-2020 as scrolling time dynamic data loaded
  getCompletedJobs(arr){
    return arr.filter(item => {
      if(item.job_status == 2){
        return item;
      }
    })
  }

  goBack(){
    this.navCtrl.pop();
  }

  moveDetails(id) {
    let data = {
      id: id
    };

    this.helper.changeMessage(JSON.stringify(data));
    this.router.navigate(['/booking-details']);
  }


  createDateFormat(date) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    let splitArr = date.split('-');

    return `${splitArr[2]} ${monthNames[parseInt(splitArr[1])-1]} ${splitArr[0]}`;

  }

}
