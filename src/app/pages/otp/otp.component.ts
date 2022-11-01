import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { AlertService } from 'src/app/service/alert.service';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { RouteGuard } from 'src/app/guard/route.guard';
import { FcmService } from 'src/app/service/fcm.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent implements OnInit {

  @ViewChild('otpinput', {static: false}) otpField: ElementRef;

  showLoader: boolean = false;
  loginData: any;
  // otp: any[] = ['','','',''];
  otp1: any = '';
  otp2: any = '';
  otp3: any = '';
  otp4: any = '';
  otp5: any = '';
  otp6: any = '';

  constructor(
    private route:Router,
    private helper: HelpermethodsService,
    private alert: AlertService, 
    private apiService: ApiService, 
    private router: Router,
    private toast: ToasterService,
    private guard: RouteGuard,
    private fcmServ: FcmService,
  ) {
    this.checkForUserLoginStatus();

    this.helper.currentMessage.subscribe(data => {
      if(data){
        this.loginData = JSON.parse(data);
        console.log('login data sssss: ............', this.loginData);        
      }
    })

  }

  ngOnInit() {}



  onTypeOtp(){   
    let inputs = this.otpField.nativeElement as HTMLInputElement;
    let allotpinputs = inputs.parentElement.children;
    let otpp = this.returnOtpCurrentValue();
    let length = this.returnlength(otpp);
    if(length < 6){
      let selected = allotpinputs[length] as HTMLInputElement;
      selected.focus();
    }
  }


  returnlength(text){
    return text.length;
  }


  category() {
    this.route.navigate(['/category']);
  }




  checkForUserLoginStatus() {
    if(this.guard.checkForUserData()) {
      // this.router.navigate(['vendor-job']);
      this.category();
    }
  }



  returnOtp() {
    let otp = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
    console.log(otp);    
    if(otp && otp.length == 6){
      return otp;
    }else{
      return '';
    }
  }

  returnOtpCurrentValue() {
    let otp = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
    return otp;   
  }




  async onSubmitOtp() {
    this.showLoader = true;
    let otp = this.returnOtp();
    console.log('final otp : ', otp);
    
    if(otp.length < 6){
      const alert = await this.alert.presentAlertConfirm('Alert!', 'Invalid OTP');
      alert.present();
      return; 
    }  
    
    
    let payload = {
      id: this.loginData.data.id,
      otp: otp
    }


    this.apiService.verifyMobile(payload).subscribe(async (res: any) => {
      if(res && res.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(res.TAP_RES);
        console.log('after otp submit responce :..............................', decrypted);
        if(decrypted.status) { 
          let encryptedData = this.helper.encryptData(decrypted.data);
          let encryptedToken = this.helper.encryptData(decrypted.token);
          localStorage.setItem('user_data', encryptedData);
          localStorage.setItem('token', encryptedToken);

          let is_token_set = await this.fcmServ.getToken();
          let toast = await this.toast.presentToast('Success!', decrypted.msg, "success", 4000);

          toast.present(); 
          this.category();
          this.showLoader = false;                   
        }else {
          localStorage.clear();
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();
          this.router.navigate(['login']);
        }
      }
    }, async err => {
        localStorage.clear();
        this.showLoader = false;
        console.log(err);
        const alert = await this.alert.presentAlertConfirm('Alert!', 'Something went wrong.');
        alert.present();
        this.router.navigate(['login']);
    });
  }
  
}
