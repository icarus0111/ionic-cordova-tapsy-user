import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { AlertService } from 'src/app/service/alert.service';
import { RouteGuard } from '../../guard/route.guard';
import { ToasterService } from 'src/app/service/toaster.service';
import { FCM } from '@ionic-native/fcm/ngx';
import { FcmService } from 'src/app/service/fcm.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  invalidLogin: boolean = false;
  showLoader: boolean = false;

  constructor(
    private route:Router,
    private formBuilder: FormBuilder, 
    private router: Router, 
    private apiService: ApiService, 
    private alert: AlertService, 
    private guard: RouteGuard, 
    private helper: HelpermethodsService,
    private toast: ToasterService,
    private fcm: FCM,
    private fcmServ: FcmService,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic
  ) { 
    this.checkForUserLoginStatus();
  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on login page.');    
    this.checkForUserLoginStatus();
    this.grantPermission();
  }

  ngOnInit() {
    console.log('Login page.');  
    this.initializeLoginForm();  
    this.getLocation();
    // this.grantPermission();
  }

  initializeLoginForm(){
    // window.localStorage.removeItem('token');
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose(
        [Validators.required, Validators.email, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]
      )]
      // phone: ['', Validators.compose(
      //   [Validators.required, Validators.minLength(9), Validators.maxLength(10), Validators.pattern(/^[0-9]*$/)]
      // )]
    });
  }



  
  otp() {
    this.route.navigate(['/otp']);
  }




  async onSubmitLoginForm() {
    this.showLoader = true;
    // console.log('form value :..........', this.getLoginFormValue());
    if (this.loginForm.invalid) {
      let toast = await this.toast.presentToast('Info!', 'Invalid Email', "primary", 4000); 
      toast.present();
      this.showLoader = false;
      return;
    }

    const loginPayload = {
      email: this.getLoginFormValue().email,
      role_id: 2
    }

    // console.log('api responce :...........', loginPayload);

    this.apiService.loginWithEmail(loginPayload).subscribe(async (data: any) => {
      // console.log('api responce :...........', data); 
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('login user data :..............................', decrypted);

        if(decrypted.status) {
          
          // let encryptedData = this.helper.encryptData(decrypted.data);
          // let encryptedToken = this.helper.encryptData(decrypted.token);
          // localStorage.setItem('user_data', encryptedData);
          // localStorage.setItem('token', encryptedToken);

          // let is_token_set = await this.fcmServ.getToken();

          let shareData = {
            token: decrypted.token,
            data: decrypted.data
          }

          this.helper.changeMessage(JSON.stringify(shareData));
          this.showLoader = false;         
                     
          // if(is_token_set){
            // this.router.navigate(['otp']);
          this.router.navigate(['otp']);
          // }       
        }else {
          // this.router.navigate(['otp']);
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
          toast.present();
        }
      }     
    });
  }




  getLoginFormValue() {
    return this.loginForm.value;
  }




  async showPhoneNumberError() {
    let errors = await this.phoneErrors();
    // console.log(errors);    
  }




  async phoneErrors() {
    return this.loginForm.controls.phone.errors;
  }





  checkForUserLoginStatus() {
    if(this.guard.checkForUserData()){
      this.router.navigate(['category']);
      return;
    }
  }




  getToken() {
    this.fcm.getToken().then(token => {
      console.log('get token ############## :.............', token);    
      return token;
    });
  }





  getLocation() {
    return new Promise((resolve, reject)=>{
      this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((resp) => {
        console.log('location responce data :...............', resp);

        if(resp && resp.coords.latitude && resp.coords.longitude){
          let cus_location = {
            lat: resp.coords.latitude,
            long: resp.coords.longitude,
          }
          // localStorage.setItem('LOC_DATA', this.helper.encryptData(cus_location));
          resolve(cus_location);
        }  
      }).catch((error) => {
        console.log('Error getting location', error);
        reject(error);
      });
    })    
  }



  // getLocation

  grantPermission() {  
  this.diagnostic.isCameraAuthorized()
  .then(authorized => {
    console.log('Location is ' + (authorized ? 'authorized' :   'unauthorized'));
   if (!authorized) {
         // location is not authorized
      this.diagnostic.requestCameraAuthorization().then((status) => {
        switch (status) {
        case this.diagnostic.permissionStatus.NOT_REQUESTED:
              console.log('Permission not requested');
              break;
        case this.diagnostic.permissionStatus.GRANTED:
              console.log('Permission granted');
              break;
        case this.diagnostic.permissionStatus.DENIED:
              console.log('Permission denied');
              break;
        case this.diagnostic.permissionStatus.DENIED_ALWAYS:
              console.log('Permission permanently denied');
              break;
          }
      }).catch(error => {
              console.log(error);
            });
          }
        }).catch(err => {
          console.log(err);
        });
  }
  
  


}
