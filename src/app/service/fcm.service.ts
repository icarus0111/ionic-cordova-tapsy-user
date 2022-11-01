import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';
import { FCM } from '@ionic-native/fcm/ngx';
// import { Firebase } from '@ionic-native/firebase/ngx';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
// import { Firebase } from '@ionic-native/firebase/ngx';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private platform: Platform, 
    private apiServ: ApiService,
    private fcm: FCM,
    // private firebaseNative: Firebase,
    private helper: HelpermethodsService,
  ) { }


  async getToken() {
    let token;

    if (this.platform.is('android')) {     
        return this.fcm.getToken().then(async (token) => {
          token = token;
          // alert('token value :................'+ token);
          let is_saved = await this.saveTokenToDB(token); 
          if(is_saved){
            return true;
          }
        });      
    }


    if (this.platform.is('ios')) {

      this.fcm.hasPermission().then(data => {

      }).catch(err => {

      })
      
      return this.fcm.getToken().then(async (token) => {
        token = token;
        let is_saved = await this.saveTokenToDB(token);
        if(is_saved){
          return true;
        }
      });      
    }
     
    
    // Is not cordova == web PWA
    if (!this.platform.is('cordova')) {
      // TODO add PWA support with angularfire2
    } 
    
    // console.log('token value before add :................', token);   
  }




  async saveTokenToDB(token) {
    
    let userData = this.helper.checkForUserData();
    if(!userData){
      return;
    }

    let payload = {
      user_id: userData.id,
      fcm_token: token
    }

    console.log('token update data :.................', payload);    

    return this.apiServ.addToken(payload).subscribe((data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        if(decrypted.status){
          console.log('token updated successfully :...................', decrypted); 
          return true;         
        }else{
          console.log('token updated successfully :...................', decrypted);
          return false;
        }
      }      
    });

  }



}
