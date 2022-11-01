import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { StripeService } from 'src/app/service/stripe.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'src/app/service/alert.service';

@Component({
  selector: 'app-card-payment',
  templateUrl: './card-payment.component.html',
  styleUrls: ['./card-payment.component.scss'],
})
export class CardPaymentComponent implements OnInit {

  showLoader: boolean = false;
  paymentForm: FormGroup;
  monthlist: { name: string; value: string; }[];
  yearlist: any[];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private helper: HelpermethodsService,
    private apiService: ApiService,
    private toast: ToasterService,
    private stripeSrv: StripeService,
    private formBuilder: FormBuilder,
    private alert: AlertService, 
    ) { }

  ngOnInit() {
    this.initializeForm();
    this.getMonthList();  
    this.getYearList();
  }



  goToLocation() {
    this.router.navigate(['/location']);
  }



  goBack() {
    this.navCtrl.pop();
  }




  initializeForm(){
    // window.localStorage.removeItem('token');
    this.paymentForm = this.formBuilder.group({
      name: ['test name', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(40), Validators.pattern(/^[a-zA-Z ]*$/)])],
      card_number: ['4242424242424242', Validators.compose([Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern(/^[0-9]*$/)])],
      month: [null, Validators.compose([Validators.required])],
      year: [null, Validators.compose([Validators.required])],
      cvv: ['123', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^[0-9]*$/)])]
    });
  }




  async createJobAndMakePayment() {
    // console.log('create Job And Make Payment()');  
    this.showLoader = true;

    if (this.paymentForm.invalid) {
      // this.showPhoneNumberError();
      this.getFormErrors().then(async(data: any) => {
        console.log('errors messages list :............', data); 
        if(data && data.length > 0){
          const alert = await this.alert.presentAlertConfirm('Alert!', data[0].errorText);
          alert.present();
        }               
      }).catch(err=> {
        console.log(err);        
      }); 
      
      this.showLoader = false;
      return;
    }

    // let category: any = await this.helper.getCategoryFromLocal();
    // let subCategory: any = await this.helper.getSubCategoryFromLocal();
    // let service: any = await this.helper.getServiceDetailsFromLocal();
    // let formData = this.helper.getFormData().data;
    // let imageData = this.helper.getImageData();
    let dateTime = this.helper.jobCartData();
    let jobData = this.helper.getJobData();
    // let jobNote = this.helper.jobNoteData();
    let stripeCardData = this.paymentForm.value;

    // let payload = {
    //   data: {
    //     customer_id: this.helper.checkForUserData().id,
    //     service_id: service.service_id,
    //     details: JSON.stringify(formData),
    //     price: dateTime.data.amount,
    //     date: dateTime.data.date,
    //     time: dateTime.data.time,
    //     job_note: jobNote.data,
    //     imageName: Date.now()
    //   },
    //   image: imageData.data
    // }

    // console.log('######### jobs payload data :...................', payload); 
    // console.log('######### stripe card value :...................', this.paymentForm.value); 

    
    // this.apiService.createJobs(payload).subscribe(async (data: any)=>{
      // if(data && data.TAP_RES) {
        // let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        // console.log('decrypted job data :..............................', decrypted);
        // this.showLoader = false;
        // if(decrypted.status) {          
          // let encryptedData = this.helper.encryptData(decrypted.data);         
          // localStorage.setItem('job_data', encryptedData);  
          // let jobId = decrypted.data.id;      
          // this.router.navigate(['/booking-timing']);
          // this.showLoader = true;
          this.stripeSrv.getStripeSourceToken(stripeCardData).then(token => {
            // console.log('####### .... stripe token......', token);           

            let payload = {
              amount: dateTime.data.amount*100, 
              token: token, 
              description: `creating charge for customer id ${this.helper.checkForUserData().id}` 
            }

            console.log('create charge data : .............', payload);            

            this.apiService.createCharge(payload).subscribe(async (data)=>{
              if(data && data.TAP_RES) {
                let decrypted = this.helper.decryptResponceData(data.TAP_RES);
                // console.log('decrypt data :............', decrypted); 
                if(decrypted.status) {
                  this.showLoader = false;
                  let encryptedChargeData = this.helper.encryptData(decrypted.data);
                  localStorage.setItem('charge_id', encryptedChargeData);

                  // let paymentUpdatePayload = {
                  //   job_id: jobData.id,
                  //   updateData: {
                  //     charge_id: decrypted.data
                  //   }
                  // }

                  this.goToLocation();

                  // this.apiService.updatePaymentDetails(paymentUpdatePayload).subscribe(async (data) =>{
                  //   if(data && data.TAP_RES) {
                  //     let decrypted = this.helper.decryptResponceData(data.TAP_RES);
                  //     console.log('decrypt data :............', decrypted); 
                  //     if(decrypted.status){
                  //       console.log('payment data :............', decrypted.msg);
                  //       this.goToLocation();
                  //     }else{
                  //       this.showLoader = false;
                  //       let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
                  //       toast.present();
                  //     }
                  //   }
                  // },error => {
                  //   console.log('####### err', error);
                  //   this.showLoader = false;
                  // });

                } else{
                  this.showLoader = false;
                  let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
                  toast.present();
                }              
              }
            }, error => {
              console.log('####### err', error);
              this.showLoader = false;
            });
          }).catch(err => {
            console.log('####### .... stripe token......', err);
            this.showLoader = false;
          });
        // }else{
        //   this.showLoader = false;
        //   let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
        //   toast.present();
        // }
      // }
    // }, error =>{
    //   this.showLoader = false;
    //   console.log(error);      
    // });
  }






  getFormErrors() {
    // console.log(this.loginForm.controls);
    let allFields = this.paymentForm.controls;
    let size = Object.keys(allFields).length;
    var err = {};
    let errorArray = [];

    return new Promise((resolve, reject) => {
      Object.entries(allFields).forEach(
        ([key, value], index) => {
          
          if(value.errors){  
            Object.entries(value.errors).forEach(
              ([k, valu]) => {
                // console.log(key, value);
                err = this.getErrorTexts(k,valu,key);         
                errorArray.push(err);
              }
            );
          }

          if(index+1 == size) {
            resolve(errorArray);
          }
          
        }
      );      
    });    
  }






  getErrorTexts(k,valu,key) {
    let errTexts = this.helper.getErrorText();
    // var err = {};
    if(k == 'minlength' || k == 'maxlength') {
      return {
        fieldName: key,
        errorType: k,
        errorText: `${errTexts[k]} ${valu.requiredLength} on ${key.replace(/_/gi, ' ').toUpperCase()}`
      }                  
    } else if(k == 'required') {
      return {
        fieldName: key,
        errorType: k,
        errorText: `${key.replace(/_/gi, ' ').toUpperCase()} ${errTexts[k]}`
      }
    } else {                  
      return {
        fieldName: key,
        errorType: k,
        errorText: `${errTexts[k]} ${key.toUpperCase()}`
      }
    }
  }






  onNameType(e){

    let modifiedName = e.target.value.replace(/[\d+`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    // console.log('name typed...............', modifiedName);        
    e.target.value = modifiedName.toLowerCase().split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
    
    this.paymentForm.patchValue({
      name: modifiedName.toLowerCase().split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
    });
  }






  onCardNumberType(e){
    // console.log(e.target.value);
    let num = e.target.value; 
    num = num.replace(/[^0-9.]/g, ''); 
    e.target.value = num;

    this.paymentForm.patchValue({
      card_number: num
    });

    if(num.length > 16){
      let trim = num.substring(0, 16);
      e.target.value = trim;
      this.paymentForm.patchValue({
        card_number: trim
      });
      // console.log(trim);
    }
        
  }





  onCvvType(e){
    // console.log(e.target.value);

    let num = e.target.value; 
    num = num.replace(/[^0-9.]/g, ''); 
    e.target.value = num;

    this.paymentForm.patchValue({
      cvv: num
    });

    if(num.length > 3){
      let trim = num.substring(0, 3);
      e.target.value = trim;
      this.paymentForm.patchValue({
        cvv: trim
      });
      // console.log(trim);
    }
        
  }





  getMonthList() {
    this.monthlist = this.stripeSrv.generateMonth();
  }




  getYearList() {
    this.yearlist = this.stripeSrv.generateYear(15);
  }







}
