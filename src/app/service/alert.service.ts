import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(public alertController: AlertController) { }


  async presentAlertConfirm(header, message) {
    return await this.alertController.create({
      header,
      message,
      buttons: [
        // {
        //   text: 'Cancel',
        //   role: 'cancel',
        //   cssClass: 'secondary',
        //   handler: (blah) => {
        //     console.log('Confirm Cancel: blah');
        //   }
        // }, 
        {
          text: 'Okay',
          cssClass: 'okBtn',
          role: 'confirm',
          handler: () => {
            // console.log('Confirm Okay');
          }
        }
      ]
    });    
  }

}
