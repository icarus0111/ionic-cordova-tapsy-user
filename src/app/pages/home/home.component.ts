import { Component, OnInit } from '@angular/core';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { RouteGuard } from 'src/app/guard/route.guard';
import { Router } from '@angular/router';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  showLoader: boolean = false;

  constructor(private helper: HelpermethodsService, private guard: RouteGuard, 
    private router: Router,
    private diagnostic: Diagnostic
    ) {
    this.checkForUserLoginStatus();
   }

  ionViewWillEnter(){
    this.checkForUserLoginStatus();
    this.grantPermission();
  }

  ngOnInit() {
    console.log('Home component'); 
    this.grantPermission();   
  }


  checkForUserLoginStatus() {
    if(this.guard.checkForUserData()){
      this.router.navigate(['category']);
      return;
    }
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
