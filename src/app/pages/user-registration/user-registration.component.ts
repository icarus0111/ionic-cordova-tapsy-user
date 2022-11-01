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
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})
export class UserRegistrationComponent implements OnInit {

  registerForm: FormGroup;
  invalidLogin: boolean = false;
  showLoader: boolean = false;

  constructor(
    private route: Router,
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
  ) { }

  ngOnInit() {
    this.initializeLoginForm();
  }


  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on login page.');    
    this.checkForUserLoginStatus();
    this.grantPermission();
    
  }


  initializeLoginForm(){
    // window.localStorage.removeItem('token');
    this.registerForm = this.formBuilder.group({      
      first_name: ['', Validators.compose(
        [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z ]*$/)]
      )],
      last_name: ['', Validators.compose(
        [Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z ]*$/)]
      )],      
      phone: ['', Validators.compose(
        [Validators.required, Validators.minLength(9), Validators.maxLength(10), Validators.pattern(/^[0-9]*$/)]
      )],
      email: ['', Validators.compose(
        [Validators.required, Validators.email, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]
      )]
    });
  }



  checkForUserLoginStatus() {
    if(this.guard.checkForUserData()){
      this.router.navigate(['category']);
      return;
    }
  }





  getFormErrors() {
    // console.log(this.loginForm.controls);
    let allFields = this.registerForm.controls;
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





  onSubmitRegisterForm(){
    this.showLoader = true;
    if (this.registerForm.invalid) {
      this.getFormErrors().then(async(data: any) => {
        console.log('errors messages list ###:............', data); 
        if(data && data.length > 0){
          // const alert = await this.alert.presentAlertConfirm('Alert!', data[0].errorText);
          // alert.present();
          let toast = await this.toast.presentToast('Info!', data[0].errorText, "primary", 4000); 
          toast.present();
        }               
      }).catch(err=> {
        console.log(err);        
      }); 
      
      this.showLoader = false;
      return;
    }


    const Payload = {
      name: this.getFullName(this.getFormValue().first_name, this.getFormValue().last_name),
      email: this.getFormValue().email,
      phone: this.getFormValue().phone,
      password: '12345',
      role_id: 2
    }


    this.apiService.register(Payload).subscribe(async (data: any) => {
      // console.log('api responce :...........', data); 
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('register user data :..............................', decrypted);

        if(decrypted.status) {

          let shareData = {
            token: decrypted.token,
            data: decrypted.data
          }

          this.helper.changeMessage(JSON.stringify(shareData));
          this.showLoader = false;         
                     
          // if(is_token_set){
            // this.router.navigate(['otp']);
          this.showLoader = false;
          this.router.navigate(['otp']);
          this.registerForm.reset();
          // }       
        }else {
          // this.router.navigate(['otp']);
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 3000); 
          toast.present();
        }
      }     
    }, async error => {
      this.showLoader = false;
      let toast = await this.toast.presentToast('Error!', 'Server not responding', "danger", 3000); 
      toast.present();
    });

  }





  getFormValue() {
    return this.registerForm.value;
  }





  getFullName(fname: string, lname: string){
    let fn = fname.trim();
    let ln = lname.trim();
    return `${fn} ${ln}`;
  }




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
