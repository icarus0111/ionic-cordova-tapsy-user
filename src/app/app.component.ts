import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { Router } from '@angular/router';
import { FcmService } from 'src/app/service/fcm.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { HelpermethodsService } from './service/helpermethods.service';
import { ApiService } from './service/api.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
// import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  // options: PushOptions = {
  //   android: {},
  //   ios: {
  //       alert: 'true',
  //       badge: true,
  //       sound: 'true'
  //   },
  //   windows: {},
  //   browser: {
  //       pushServiceURL: 'http://push.api.phonegap.com/v1/push'
  //   }
  // }

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private fcm: FCM,
    private router: Router,
    private fcmServ: FcmService,
    private toast: ToasterService,
    private helper: HelpermethodsService,
    private apiService: ApiService,
    private diagnostic: Diagnostic,
    // private push: Push
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();

          // console.log('hello');
        }, false);
      });


      this.statusBar.styleDefault();
      
      setTimeout(() => {
        this.splashScreen.hide();
      }, 18000);
      
      // let status bar overlay webview
      this.statusBar.overlaysWebView(false);
      // set status bar to white
      // this.statusBar.backgroundColorByHexString('#000');
      // this.getToken();


      this.fcm.onTokenRefresh().subscribe(async(token) => {
        // alert('refresh token '+ token);
        await this.fcmServ.saveTokenToDB(token);
      });



      this.fcm.onNotification().subscribe(async (data) => {
        console.log(data);
        if (data.wasTapped) {
          // console.log('Received in background');          
          // alert('on notification '+ JSON.stringify(data));
          console.log('push notification data :.....', data);
          if(data.type == 'vendor_answer' && data.accepted == 'true'){
            let encryptedData = this.helper.encryptData(data);          
            localStorage.setItem('vendor_push_data', encryptedData);

            let payload = {
              id: data.vendor_id
            }

            this.apiService.getVendorById(payload).subscribe(async(datas: any)=>{
              if(datas && datas.TAP_RES) {
                let decrypted = this.helper.decryptResponceData(datas.TAP_RES);
                console.log('near by vendor data :..............................', decrypted);
                if(decrypted.status){
                  let encryptedData = this.helper.encryptData(decrypted.data); 
                  let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
                  toast.present();         
                  localStorage.setItem('accept_vendor_data', encryptedData);
                  // this.router.navigate([`track-vendor`]);
                  if(this.checkForScheduledJob()){
                    this.router.navigate(['my-booking']);
                  }else{
                    this.router.navigate(['track-vendor']);
                  }
                }
              }
            });
            
          } else if(data.type == 'vendor_answer' && data.accepted == 'false') {
            let vendors = this.helper.getSortedVendorList();
            this.helper.deleteFirstVendorFromTheListAndSave(vendors);
            this.helper.changeMessage(JSON.stringify({ vendorListUpdated: true }));
            let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
            toast.present(); 
          }else{
            let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
            toast.present();
            this.router.navigate(['category']);
          }




          if(data.type == 'vendor_arrived') {
            let encryptedData = this.helper.encryptData(data);          
            localStorage.setItem('vendor_arrived_data', encryptedData);

            this.helper.changeMessage(JSON.stringify({vendor_arrived: true}));

            // let payload = {
            //   id: data.vendor_id
            // }

            // this.apiService.getVendorById(payload).subscribe(async(data: any)=>{
            //   if(data && data.TAP_RES) {
            //     let decrypted = this.helper.decryptResponceData(data.TAP_RES);
            //     console.log('near by vendor data :..............................', decrypted);
            //     if(decrypted.status){
            //       let encryptedData = this.helper.encryptData(decrypted.data); 
            //       let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
            //       toast.present();         
            //       localStorage.setItem('accept_vendor_data', encryptedData);
            //       this.router.navigate(['job-accepted']);
            //     }
            //   }
            // });
          }


          if(data.type === 'approve_job'){
            let encryptedData = this.helper.encryptData(data);          
            localStorage.setItem('approve_job_data', encryptedData);
            this.router.navigate(['success']); 
            this.helper.changeMessage(JSON.stringify({job_approved: true}));
          } 

          
        } else {
          // console.log('Received in foreground');
          // alert('on notification '+ JSON.stringify(data));
          console.log('push notification data :.....', data);
          if(data.type == 'vendor_answer' && data.accepted == 'true'){
            let encryptedData = this.helper.encryptData(data);          
            localStorage.setItem('vendor_push_data', encryptedData);

            let payload = {
              id: data.vendor_id
            }

            this.apiService.getVendorById(payload).subscribe(async(datas: any)=>{
              if(datas && datas.TAP_RES) {
                let decrypted = this.helper.decryptResponceData(datas.TAP_RES);
                console.log('near by vendor data :..............................', decrypted);
                if(decrypted.status){
                  let encryptedData = this.helper.encryptData(decrypted.data); 
                  let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
                  toast.present();          
                  localStorage.setItem('accept_vendor_data', encryptedData);
                  if(this.checkForScheduledJob()){
                    this.router.navigate(['my-booking']);
                  }else{
                    this.router.navigate(['track-vendor']);
                  }
                }
              }
            });
          } else if(data.type == 'vendor_answer' && data.accepted == 'false') {
            let vendors = this.helper.getSortedVendorList();
            this.helper.deleteFirstVendorFromTheListAndSave(vendors);
            this.helper.changeMessage(JSON.stringify({ vendorListUpdated: true }));
            let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
            toast.present(); 
          }else{
            let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
            toast.present();
          }
          
          



          if(data.type == 'vendor_arrived') {
            let encryptedData = this.helper.encryptData(data);          
            localStorage.setItem('vendor_arrived_data', encryptedData);

            this.helper.changeMessage(JSON.stringify({vendor_arrived: true}));
            
            // let payload = {
            //   id: data.vendor_id
            // }

            // this.apiService.getVendorById(payload).subscribe(async(data: any)=>{
            //   if(data && data.TAP_RES) {
            //     let decrypted = this.helper.decryptResponceData(data.TAP_RES);
            //     console.log('near by vendor data :..............................', decrypted);
            //     if(decrypted.status){
            //       let encryptedData = this.helper.encryptData(decrypted.data); 
            //       let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
            //       toast.present();         
            //       localStorage.setItem('accept_vendor_data', encryptedData);
            //       this.router.navigate(['job-accepted']);
            //     }
            //   }
            // });
          }




          if(data.type === 'approve_job'){
            let encryptedData = this.helper.encryptData(data);          
            localStorage.setItem('approve_job_data', encryptedData);
            this.router.navigate(['success']); 
            this.helper.changeMessage(JSON.stringify({job_approved: true}));
          } 




          // this.router.navigate(['category']);          
        }
      });


      this.grantPermission();
    });
  }





  // getToken(){
  //   this.fcm.getToken().then(token => {
  //     console.log('get token ############## :.............', token);    
  //     // backend.registerToken(token);
  //   });
  // }





  grantPermission() {  
    this.diagnostic.isRemoteNotificationsEnabled().then(authorized => {
      console.log('push is ' + (authorized ? 'authorized' :   'unauthorized'));
     if (!authorized) {
           // location is not authorized
        this.diagnostic.requestRemoteNotificationsAuthorization().then((status) => {
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
    }}).catch(err => {
            console.log(err);
    });




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





        // to check if we have permission
        // this.push.hasPermission()
        // .then((res: any) => {

        //   if (!res.isEnabled) {
        //     // console.log('We did't have permission to send push notifications');
        //     const pushObject: PushObject = this.push.init(this.options);
        //     // pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));
        //   }
        // });
  }






  checkForScheduledJob() {
    let isJobScheduled = localStorage.getItem('isJobScheduled');

      if(isJobScheduled) {
        if(isJobScheduled == 'true'){
          return true;
        }else{
          return false;
        }
      }
  }






  
  
}





// Project-level build.gradle

// buildscript {
//   repositories {
//     // Check that you have the following line (if not, add it):
//     google()  // Google's Maven repository
//   }
//   dependencies {
//     ...
//     // Add this line
//     classpath 'com.google.gms:google-services:4.3.2'
//   }
// }

// allprojects {
//   ...
//   repositories {
//     // Check that you have the following line (if not, add it):
//     google()  // Google's Maven repository
//     ...
//   }
// }




// App-level build.gradle

// apply plugin: 'com.android.application'
// dependencies {
//   // add the Firebase SDK for Google Analytics
//   implementation 'com.google.firebase:firebase-analytics:17.2.0'
//   // add SDKs for any other desired Firebase products
//   // https://firebase.google.com/docs/android/setup#available-libraries
// }
// Add to the bottom of the file
//apply plugin: 'com.google.gms.google-services'





// this.commServ.changeMessage(JSON.stringify({ locationSet: true }));
// this.commServ.currentMessage.subscribe(data => {});




// cordova.plugins.diagnostic.requestRemoteNotificationsAuthorization({
//   successCallback: function(){
//       console.log("Successfully requested remote notifications authorization");
//   },
//   errorCallback: function(err){
//      console.error("Error requesting remote notifications authorization: " + err);
//   },
//   types: [
//       cordova.plugins.diagnostic.remoteNotificationType.ALERT,
//       cordova.plugins.diagnostic.remoteNotificationType.SOUND,
//       cordova.plugins.diagnostic.remoteNotificationType.BADGE
//   ],
//   omitRegistration: false
// });
