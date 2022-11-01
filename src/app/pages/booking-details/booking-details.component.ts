import { Component, OnInit } from '@angular/core';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { ApiService } from 'src/app/service/api.service';
import { AlertService } from 'src/app/service/alert.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss'],
})
export class BookingDetailsComponent implements OnInit {

  showLoader: boolean = false;
  id: any;
  booking_details: any;
  details: any;
  showReviewSection: boolean = false;

  constructor(
    private alert: AlertService,
    private apiService: ApiService,
    private helper: HelpermethodsService,
    private navCtrl: NavController,
    private router: Router,
  ) {
    this.helper.currentMessage.subscribe(async (data: any) => {
      if(data) {
        let details = JSON.parse(data);
  
        if(details && details.id) {
          this.id = details.id;
        }else{
          this.router.navigate(['my-booking']);
        }
      }
    });
  }

  ngOnInit() {
    this.getBookingDetails();
  }

  getBookingDetails() {
    this.showLoader = true;

    let payload = {
      id: this.id
    }

    this.apiService.getBookingDetails(payload).subscribe(async (data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        if(decrypted.status) {
          this.booking_details = decrypted.data[0];
          if(decrypted.data[0].details) {
            this.details = JSON.parse(decrypted.data[0].details);
            if(this.details.formData){
              this.details = this.details.formData;
            }
            console.log('details :.......', this.details);
          }
          console.log('booking details data more :..............................', this.booking_details);

          if(this.booking_details.is_scheduled == 1 && this.booking_details.job_status == 2 && this.booking_details.is_reviewed_scheduled_job == 0){
            this.showReviewSection = true;
          }else {
            this.showReviewSection = false;
          }
          
          this.showLoader = false;

        } else {
          this.showLoader = false;
          this.router.navigate(['my-booking']);
          const alert = await this.alert.presentAlertConfirm('Alert!', 'No Data Found');
          alert.present();
        }
      } 
    }, async (error) =>{
      this.showLoader = false;
      this.router.navigate(['my-booking']);
      const alert = await this.alert.presentAlertConfirm('Alert!', 'No Data Found');
      alert.present();
    })
  }

  goBack(){
    this.navCtrl.pop();
  }


  onClickGiveReview(){
    this.helper.changeMessage(JSON.stringify({
      isComeFromScheduledJob: true,
      jobId: this.id
    }));
    this.router.navigate(['success']);
  }

}
