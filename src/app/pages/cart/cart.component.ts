import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {

  service: any;
  cartAmount: any;
  jobDate: string;
  showLoader: boolean = false;
  jobTime: string;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private helper: HelpermethodsService,
    private apiService: ApiService,
    private toast: ToasterService,
  ) { }



  ngOnInit() {
    this.getLocalServiceData();
    this.getServerDateTime();    
  }



  async goTopayment() {
    this.showLoader = true;

    let service: any = await this.helper.getServiceDetailsFromLocal();
    let formData = this.helper.getFormData().data;
    let imageData = this.helper.getImageData();
    let dateTime = this.helper.jobCartData();
    let jobNote = this.helper.jobNoteData();
    let schedule = localStorage.getItem('schedule_data');
    let isJobScheduled = localStorage.getItem('isJobScheduled');

    let scheduledStatus = null;

    if(isJobScheduled) {
      if(isJobScheduled == 'true'){
        scheduledStatus = 1;
      }else if(isJobScheduled == 'false'){
        scheduledStatus = 0;
      }
    }

    if(schedule == null){
      var d = dateTime.data.date
    }else{
      var d = dateTime.data.date2
    }

    let payload = {
      data: {
        customer_id: this.helper.checkForUserData().id,
        service_id: service.service_id,
        details: JSON.stringify(formData),
        price: dateTime.data.amount,
        date: d,
        time: dateTime.data.time,
        job_note: jobNote.data,
        imageName: Date.now().toString(),
        address: this.helper.getCustomerAddress(),
        is_scheduled: scheduledStatus
      },
      image: imageData.data
    }

    this.apiService.createJobs(payload).subscribe(async (data: any)=>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        // console.log('decrypted job data :..............................', decrypted);
        this.showLoader = false;
        if(decrypted.status) { 
          let encryptedData = this.helper.encryptData(decrypted.data);         
          localStorage.setItem('job_data', encryptedData); 
          this.router.navigate(['/card-payment']);
          this.showLoader = false;
        }else{
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
          toast.present();
        }
      }
    });


    
  }



  goBack() {
    this.navCtrl.pop();
  }



  async getLocalServiceData() {
    this.service = await this.helper.getServiceDetailsFromLocal();
    console.log('service data :........', this.service);    
  }



  getServerDateTime() {
    this.showLoader = true;
    this.apiService.getServerDateTime().subscribe((data)=>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);
        if(decrypted.status) {
          let formData = this.helper.getFormData().data;
          let price = this.getPriceType(decrypted.data.hour);
          console.log('price amount ### :...........', price);

          this.cartAmount = this.service[price];
          console.log('price amount before multiply ### :...........', this.cartAmount);

          if(formData && formData.number_of_lock) {
            this.cartAmount = this.cartAmount*formData.number_of_lock;
          }          

          console.log('price amount after multiply ### :...........', this.cartAmount); 

          this.jobDate = this.getScheduledDate(decrypted.data.dMnY);
          this.jobTime = this.getScheduledTime();
          // console.log('job date :...........', this.jobDate);
          // console.log('schedule :...........', this.getScheduledDate());

          let jobCartData = {
            amount: this.cartAmount,
            date: this.getJobDate().date,
            time: this.getJobDate().time,
            date2: this.getJobDate().date2
          }

          let encryptedData = this.helper.encryptData(jobCartData);
          localStorage.setItem('job_cart_data', encryptedData);
          this.showLoader = false;
        }else {
          this.showLoader = false;
        }
      }
    },error => {
      this.showLoader = false;
    })
  }




  getPriceType(hours) {
    if(hours >= 5 && hours <= 8){
      return 'price';
    }else if(hours <= 5) {
      return 'price';
    }else if(hours >= 8 && hours <= 16) {
      return 'price_2';
    }else if(hours >= 16 && hours <= 20){
      return 'price_3';
    }else{
      return 'price_3';
    }
  }




  getScheduledDate(date){
    let scheduleData = this.helper.getScheduledData();
    console.log('shedule data :........', scheduleData);    
    if(scheduleData.status){
      return `${scheduleData.data.date}`;
    }else if(!scheduleData.status){
      return `${date}`;
    }
  }


  getScheduledTime(){
    let scheduleData = this.helper.getScheduledData();
    console.log('shedule data :........', scheduleData);    
    if(scheduleData.status){
      return `${scheduleData.data.time}`;
    }else if(!scheduleData.status){
      return null;
    }
  }




  getJobDate(){
    let scheduleData = this.helper.getScheduledData();
    if(scheduleData.status){
      return { 
        date: `${scheduleData.data.date}`, 
        time: `${scheduleData.data.time}`,
        date2: `${scheduleData.data.date2}` 
      };
    }else if(!scheduleData.status){
      return { 
        date: `${this.helper.getCurrentDate()}`,
        time: `${this.helper.getCurrentTime()}`
    }
  }
}




}
