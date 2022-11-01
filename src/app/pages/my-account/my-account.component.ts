import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { ApiService } from 'src/app/service/api.service';
import { AlertService } from 'src/app/service/alert.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterService } from 'src/app/service/toaster.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit {

  tabActiveStatus: Array<any> = ['false', 'false', 'false','true'];
  showLoader: boolean = false;
  isedit: boolean = false;

  state_all: any;
  account_details: any;
  accountForm: FormGroup;
  select_cntry_srt_name: string;
  name: any = ['', ''];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private navCtrl: NavController, 
    private alert: AlertService, 
    private toast: ToasterService,
    private helper: HelpermethodsService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.state_list();
    let encryptedData = this.helper.encryptData(this.tabActiveStatus);
    localStorage.setItem('active_status', encryptedData);
  }
  
  initializeForm() {
    // window.localStorage.removeItem('token');
    this.accountForm = this.formBuilder.group({
      address: [null, Validators.compose([Validators.required])],
      state: [null, Validators.compose([Validators.required])],
      post_code: [null, Validators.compose([Validators.required])],
      suburb: [null, Validators.compose([Validators.required])]
    });

    this.accountForm.patchValue({
      address: null,
      state: null,
      post_code: null,
      suburb: null
    });
  }

  state_list() {
    this.showLoader = true;

    this.apiService.getStateList().subscribe(async (data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            //console.log('State list only:..............................', decrypted.data);
            this.state_all = decrypted.data;
          } else {
            const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No state found.');
            alert.present();
          }
          this.showLoader = false;
          this.getMyAccountDetails();
        } else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();
          this.getMyAccountDetails();
        }

      } else {
        this.showLoader = false;
        const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No state found.');
        alert.present();
      }
    }, async (error) =>{
      this.showLoader = false;
      const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
      alert.present();
    })
  }
  
  checkValue(event) { 
    let state_id = event.target.value;

    this.state_all.forEach(element => {
      if(element.id == state_id) {
        this.select_cntry_srt_name = element.short_name;
      }
    });
    //console.log(this.select_cntry_srt_name);
  }




  getMyAccountDetails() {
    this.showLoader = true;

    let payload = {
      id: this.helper.checkForUserData().id
    }

    this.apiService.getMyAccountDetail(payload).subscribe(async (data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            console.log('My account data only:..............................', decrypted.data[0]);
            this.account_details = decrypted.data[0];

            if(decrypted.data[0].state_details && decrypted.data[0].state_details.short_name){
              console.log('My account data only if block :..............................');
              this.select_cntry_srt_name = decrypted.data[0].state_details.short_name;              
            }else{
              console.log('My account data only else block :..............................');
              this.account_details.state_details = {};              
              this.account_details.state_details.short_name = null;               
            }            

            this.accountForm.patchValue({
              address: decrypted.data[0].address,
              state: +decrypted.data[0].state,
              post_code: decrypted.data[0].post_code,
              suburb: decrypted.data[0].suburb
            });
            
            if(decrypted.data[0].name){
              this.name = decrypted.data[0].name.split(' ');
            }
          } else {
            const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No details found.');
            alert.present();
          }
          this.showLoader = false;
        } else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();
        }
      } else {
        this.showLoader = false;
        const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No details found.');
        alert.present();
      }
    }, async (error) =>{
      this.showLoader = false;
      const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
      alert.present();
    })
  }



  

  async onSubmitMyAccountForm() {
    if (this.accountForm.invalid) {
      this.getFormErrors().then(async(data: any) => {
        console.log('Errors messages list :............', data); 
        if(data && data.length > 0){
          const alert = await this.alert.presentAlertConfirm('Alert!', data[0].errorText);
          alert.present();
        }               
      }).catch(err=> {
        console.log(err);        
      }); 
      
      this.showLoader = false;
      return;
    } else {
      const accountPayload = {
        id: this.helper.checkForUserData().id,
        updateData: {
          address: this.getAccountFormValue().address,
          state: this.getAccountFormValue().state,
          post_code: this.getAccountFormValue().post_code,
          suburb: this.getAccountFormValue().suburb
        }
      }
      //console.log('Account accountPayload...', accountPayload);
      
      this.apiService.account_upadate(accountPayload).subscribe(async (data: any) => {
        // console.log('api responce :...........', data); 
        if(data && data.TAP_RES) {
          let decrypted = this.helper.decryptResponceData(data.TAP_RES);
          //console.log('Account decrypted data :........................', decrypted);
  
          if(decrypted.status){
            this.showLoader = false;

            this.account_details.address = this.getAccountFormValue().address;
            this.account_details.state = this.getAccountFormValue().state;
            this.account_details.state_details.short_name = this.select_cntry_srt_name;
            this.account_details.post_code = this.getAccountFormValue().post_code;
            this.account_details.suburb = this.getAccountFormValue().suburb;

            let toast = await this.toast.presentToast('Success!', decrypted.msg, "success", 5000); 
            toast.present();
            
            this.isedit = false;
          } else {
            this.showLoader = false;
            let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
            toast.present();
          }
        }     
      }, error => {
        this.showLoader = false;
      });
    } 
  }

  getFormErrors() {
    // console.log(this.loginForm.controls);
    let allFields = this.accountForm.controls;
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

  getAccountFormValue() {
    return this.accountForm.value;
  }

  edit_account() {
    this.isedit = true;
  }

  cancel_edit() {
    this.isedit = false;
  }

  goBack() {
    this.navCtrl.pop();
  }

}
