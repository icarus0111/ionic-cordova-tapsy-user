import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
declare var google;

@Component({
  selector: 'app-job-accepted',
  templateUrl: './job-accepted.component.html',
  styleUrls: ['./job-accepted.component.scss'],
})
export class JobAcceptedComponent implements OnInit {

  @ViewChild('mapElement', {static: true}) mapNativeElement: ElementRef;
  // @ViewChild('autoCompleteInput', {static: true}) inputNativeElement: any;

  directionsService: any = new google.maps.DirectionsService;
  directionsDisplay: any = new google.maps.DirectionsRenderer;
  distanceService: any = new google.maps.DistanceMatrixService;

  latitude: any;
  longitude: any;
  acceptVendorData: { data: any; status: boolean; };
  categary: any;
  service: any;
  showLoader: boolean = false;

  constructor(
    private geolocation: Geolocation, 
    private helper: HelpermethodsService,
    private route: Router,
    private toast: ToasterService,
    private callNumber: CallNumber,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    // this.renderInitMapForDirection();
    this.goToTrackingPage();
    this.setMarkerOnCurrentPosition();
    // this.renderInitMapForDirection();
    // this.goToTrackingPage();
    this.setJobGoingOnFlag();
    this.getCategory();
    this.getAcceptVendorData();
  }





  setJobGoingOnFlag(){
    let is_job_going = {
      status: true
    }

    let encryptedData = this.helper.encryptData(is_job_going);
    localStorage.setItem('is_job_going', encryptedData);
  }



  renderInitMapForDirection() {
    const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      zoom: 18,
      center: {lat: -33.8688, lng: 151.2093}
    });
    this.directionsDisplay.setMap(map);
    // this.getDirection();
  }


  // getDirection() {
  //   // calculateAndDisplayRoute(formValues) {
  //     console.log('finding direction................');      
  //     const that = this;
  //     this.directionsService.route({
  //       origin: 'sydney',
  //       destination: 'melbourne',
  //       travelMode: 'DRIVING'
  //     }, async (response, status) => {
  //       console.log(response);        
  //       if (status == 'OK') {
  //         this.directionsDisplay.setDirections(response);
  //         this.getDistance(response.request.origin.query, response.request.destination.query);
  //       } else {
  //         let toast = await this.toast.presentToast('Success!', 'Directions request failed due to ' + status, "danger", 5000); 
  //         toast.present();
  //         // window.alert('Directions request failed due to ' + status);
  //       }
  //     });
  //   // }
  // }




  // getDistance(source, destination) {
  //   // this.distanceService.
  //   // var origin1 = new google.maps.LatLng(55.930385, -3.118425);
  //   this.distanceService.getDistanceMatrix({
  //     origins: [source],
  //     destinations: [destination],
  //     travelMode: 'DRIVING'
  //   }, async (response, status) => {
  //     console.log('#########  Distance  #########', response);

  //     let toast = await this.toast.presentToast('Success!', 'Distance calculated successfully ' + response.rows[0].elements[0].distance.text, "success", 5000); 
  //     toast.present(); 

  //     // if (status == 'OK') {
  //     //   that.directionsDisplay.setDirections(response);
  //     //   this.getDistance(response.geocoded_waypoints[0].place_id, response.geocoded_waypoints[1].place_id);
  //     // } else {
  //     //   window.alert('Directions request failed due to ' + status);
  //     // }
  //   });



  //   // this.goToPaymentPage();
  // }




  setMarkerOnCurrentPosition(){
    this.getLocation().then((data: any) => {
      const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        center: {lat: data.lat, lng: data.long},
        zoom: 18
      });

      const pos = {
        lat: data.lat,
        lng: data.long
      };

      const infowindow = new google.maps.InfoWindow();
      const infowindowContent = document.getElementById('infowindow-content');

      infowindow.setContent(infowindowContent);

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

      marker.setVisible(true);

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

      infoWindow.setPosition(pos, marker);
      infoWindow.setContent(contentString);

      this.autoComplete(data.lat, data.long);
    }).catch(err => {
      console.log(err);      
    })
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
          resolve(cus_location);
        }  
      }).catch((error) => {
        console.log('Error getting location', error);
        reject(error);
      });
    })    
  }






  autoComplete(lat, long) {
    const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      center: {lat: lat, lng: long},
      zoom: 18
    });

    const pos = {
      lat: lat,
      lng: long
    };

    const icon = {
      url: 'http://res.cloudinary.com/tapsy/image/upload/v1572870098/u_fzktfv.png', // image url
      scaledSize: new google.maps.Size(50, 50), // scaled size
    };

    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById('infowindow-content');

    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
      position: pos,
      map: map,
      icon: icon,
      anchorPoint: new google.maps.Point(0, -29)
    });

    // const autocomplete = new google.maps.places.Autocomplete(this.inputNativeElement.nativeElement as HTMLInputElement);
    // autocomplete.addListener('place_changed', () => {
    //   infowindow.close();
    //   marker.setVisible(false);
    //   const place = autocomplete.getPlace();

    //   let cus_location = {
    //     lat: place.geometry.location.lat(),
    //     long: place.geometry.location.lng()
    //   }

    //   console.log('place data :................', cus_location); 

    //   if (!place.geometry) {
    //     // User entered the name of a Place that was not suggested and
    //     // pressed the Enter key, or the Place Details request failed.
    //     window.alert('No details available for input: ' + place.name );
    //     return;
    //   }

    //   if (place.geometry.viewport) {
    //     map.fitBounds(place.geometry.viewport);
    //   } else {
    //     map.setCenter(place.geometry.location);
    //     map.setZoom(17);  // Why 17? Because it looks good.
    //   }

    //   marker.setPosition(place.geometry.location);
    //   marker.setVisible(true);
    //   let address = '';

    //   if (place.address_components) {
    //     address = [
    //       (place.address_components[0] && place.address_components[0].short_name || ''),
    //       (place.address_components[1] && place.address_components[1].short_name || ''),
    //       (place.address_components[2] && place.address_components[2].short_name || '')
    //     ].join(' ');
    //   }

    //   if(infowindowContent){
    //     infowindowContent.children['place-icon'].src = place.icon;
    //     infowindowContent.children['place-name'].textContent = place.name;
    //     infowindowContent.children['place-address'].textContent = address;
    //   } 

    //   infowindow.open(map, marker);
    // });

  }






  getAcceptVendorData(){
    this.acceptVendorData = this.helper.getAcceptVendorData();
    return this.acceptVendorData.status;
  }






  goToTrackingPage() {
    setTimeout(() => {
      this.route.navigate([`track-vendor`]);
    }, 8000);    
  }





  async getCategory(){
    this.categary = await this.helper.getCategoryFromLocal();
    this.getService();
  }




  getService(){
    this.helper.getServiceDetailsFromLocal().then((data)=>{
      this.service = data;
    }).catch(err=>{
      console.log(err);
    });

    this.getAddress();
  }



  getAddress(){
    let addr = this.helper.getCustomerAddress();
    if(addr){
      return addr;
    }else{
      return 'Unit 2/360 Orange Grove Road, Salisbury...';
    }
  }




  async onClickCallIcon(){
    let userData: any = await this.helper.checkForUserData();
    this.callNumber.callNumber(userData.phone, true)
    .then(res => {
      console.log('Launched dialer!', res)
    })
    .catch(err => 
      {console.log('Error launching dialer', err)
    });
  }




  cancelJob(){

    let jobData = this.helper.getJobData();

    let payload = {
      id: jobData.id,
      updateData: {
        job_status: 3
      }
    }

    this.apiService.updateJobs(payload).subscribe(async(data)=>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        // console.log('decrypt data :............', decrypted); 
        if(decrypted.status){
          this.route.navigate(['category']); 
        }else{
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', 'Something wrong. Try again.', "danger", 5000); 
          toast.present();
        }
      }
    }, async(error) => {
      console.log('####### err', error);
      this.showLoader = false;
      let toast = await this.toast.presentToast('Error!', 'Something wrong. Try again.', "danger", 5000); 
      toast.present();
    });
  }


}
