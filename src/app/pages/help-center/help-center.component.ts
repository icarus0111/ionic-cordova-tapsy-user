import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss'],
})
export class HelpCenterComponent implements OnInit {

  tabActiveStatus: Array<any> = ['false', 'false', 'true','false'];
  showLoader: boolean;

  constructor(private navCtrl: NavController, private helper: HelpermethodsService) { }

  ngOnInit() {
    let encryptedData = this.helper.encryptData(this.tabActiveStatus);
    localStorage.setItem('active_status', encryptedData);
  }

  goBack(){
    this.navCtrl.pop();
  }

}
