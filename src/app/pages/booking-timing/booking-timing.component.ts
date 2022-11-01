import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-booking-timing',
  templateUrl: './booking-timing.component.html',
  styleUrls: ['./booking-timing.component.scss'],
})
export class BookingTimingComponent implements OnInit {

  noteForProfessional: string = '';
  showLoader: boolean = false;
  baseImageUrl: string = environment.baseImageUrl;
  title: any;
  serviceImage: any;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private helper: HelpermethodsService,
  ) { }

  ngOnInit() {
    this.getServiceDetailsFromLocal();
  }



  getServiceDetailsFromLocal() {
    this.helper.getServiceDetailsFromLocal().then((data: any) => {
      console.log('service details :........................', data); 
      this.title = data.name; 
      this.serviceImage = data.image;
      this.showLoader = false;   
    }).catch(err => {
      console.log('service details error:........................', err);
      this.showLoader = false;
    })
  }


  goToschedule(){    
    localStorage.removeItem('schedule_data');
    localStorage.setItem('isJobScheduled', 'false');
    this.saveNoteForProfessionalData();
    this.router.navigate(['/cart']);
  }

  goToscheduleDateTime(){ 
    localStorage.setItem('isJobScheduled', 'true');   
    this.saveNoteForProfessionalData();
    this.router.navigate(['/schedule-date']);
  }

  goBack() {
    this.navCtrl.pop(); 
  }


  saveNoteForProfessionalData() {
    if(this.noteForProfessional.trim() != ''){
      let encryptedData = this.helper.encryptData(this.noteForProfessional);
      localStorage.setItem('note_for_professional', encryptedData);
    }    
  }



}
