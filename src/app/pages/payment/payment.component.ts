import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';
declare var google;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  @ViewChild('mapElement', {static: true}) mapNativeElement: ElementRef;

  latitude: any;
  longitude: any;
  showLoader: boolean = false;
  
  constructor(
    private geolocation: Geolocation, 
    private helper: HelpermethodsService,
    private route: Router
  ) { }

  

  ngOnInit() {
    this.getCurrentLocation();
  }



  getCurrentLocation() {
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((resp) => {
      console.log('location responce data :...............', resp);

      let cus_location = {
        lat: resp.coords.latitude,
        long: resp.coords.longitude,
      }

      // localStorage.setItem('LOC_DATA', this.helper.encryptData(cus_location));
      
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        center: {
          lat: -33.8688, 
          lng: 151.2093
        },
        zoom: 7
      });
      
      const pos = {
        lat: this.latitude,
        lng: this.longitude
      };

      const icon = {
        url: 'http://res.cloudinary.com/tapsy/image/upload/v1572870098/u_fzktfv.png', // image url
        scaledSize: new google.maps.Size(50, 50), // scaled size
      };

      const marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Hello World!',
        icon: icon
      });

      const contentString = '<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          '<h5 id="firstHeading" class="firstHeading">Tapsy</h5>' +
          '<div id="bodyContent">' +
          '<p>Location Testing</p>' +
          '<p>lorem ipsam</p>' +
          '</div>' +
          '</div>';


      const infoWindow = new google.maps.InfoWindow;

      infoWindow.setPosition(pos);
      infoWindow.setContent(contentString);
      // infoWindow.open(map, marker);
      map.setCenter(pos);
      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
}
