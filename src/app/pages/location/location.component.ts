import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
declare var google;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {

  @ViewChild('mapElement', {static: true}) mapNativeElement: ElementRef;
  @ViewChild('autoCompleteInput', {static: true}) inputNativeElement: any;

  directionsService: any = new google.maps.DirectionsService;
  directionsDisplay: any = new google.maps.DirectionsRenderer;
  distanceService: any = new google.maps.DistanceMatrixService;
  // geocodeService: any = new google.maps.geocodeService;

  latitude: any;
  longitude: any;
  search_location: any;
  showLoader: boolean = false;
  mylocation: any = null;
  itemName: string = '';
  map: any;
  setIntervalForUpdateLoc: any;

  constructor(
    private geolocation: Geolocation, 
    private apiService: ApiService, 
    private toast: ToasterService,
    private helper: HelpermethodsService,
    private route: Router,
    private navCtrl: NavController,
    ) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    // this.renderInitMapForDirection();    
    // this.getCurrentLocation();
    // this.getLocation();
    this.setMarkerOnCurrentPosition();
    // this.autoComplete();
    this.updatePaymentDetailsWithChargeId();
    this.getItemNameAsSubcategoryChoosed();
    this.locationUpdateInterval();
  }


  ngOnDestroy(){
    clearInterval(this.setIntervalForUpdateLoc);    
  }



  goBack(){
    this.navCtrl.pop();
  }



  renderInitMapForDirection() {
    const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      zoom: 18,
      center: {lat: -33.8688, lng: 151.2093},
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
      }, // here´s the array of controls
      disableDefaultUI: true, // a way to quickly hide all controls
      mapTypeControl: false,
      fullscreenControlOptions: false,
      panControl: false,
      streetViewControl: false,
      // scaleControl: true,
      // zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE 
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    this.directionsDisplay.setMap(map);
  }



  getCurrentLocation() {
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((resp) => {
      console.log('location responce data :...............', resp);

      let cus_location = {
        lat: resp.coords.latitude,
        long: resp.coords.longitude,
      }

      this.apiService.getPlaceInfoFromCoords(resp.coords.latitude, resp.coords.longitude).subscribe(data =>{
        console.log('location info :.......', data.results[0].formatted_address); 

        this.search_location = data.results[0].formatted_address;  
        let encryptedData = this.helper.encryptData(this.search_location);          
        localStorage.setItem('cus_address', encryptedData);  

      }, error =>{
        console.log('location info error :.......', error); 
      });      

      // this.autoComplete(resp.coords.latitude, resp.coords.longitude);

      // localStorage.setItem('LOC_DATA', this.helper.encryptData(cus_location));
      
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        center: {
          lat: resp.coords.latitude, 
          lng: resp.coords.longitude
        },
        zoom: 18,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
        }, // here´s the array of controls
        disableDefaultUI: true, // a way to quickly hide all controls
        mapTypeControl: false,
        fullscreenControlOptions: false,
        panControl: false,
        streetViewControl: false,
        // scaleControl: true,
        // zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE 
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
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


      // const infoWindow = new google.maps.InfoWindow;

      // infoWindow.setPosition(pos);
      // infoWindow.setContent(contentString);
      // infoWindow.open(map, marker);
      map.setCenter(pos);
      // marker.addListener('click', function() {
      //   infoWindow.open(map, marker);
      // });
      this.goToVendorSearch();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }





  setMarkerOnCurrentPosition(){
    this.getLocation().then((data: any) => {
      const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        center: {lat: data.lat, lng: data.long},
        zoom: 18,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
        }, // here´s the array of controls
        disableDefaultUI: true, // a way to quickly hide all controls
        mapTypeControl: false,
        fullscreenControlOptions: false,
        panControl: false,
        streetViewControl: false,
        // scaleControl: true,
        // zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE 
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      this.map = map;

      const pos = {
        lat: data.lat,
        lng: data.long
      };

      const infowindow = new google.maps.InfoWindow();
      const infowindowContent = document.getElementById('infowindow-content');

      // infowindow.setContent(infowindowContent);

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
      // infoWindow.setContent(contentString);

      this.autoComplete(data.lat, data.long);
    }).catch(err => {
      console.log(err);      
    })
  }






  setMarkerOnCurrentPosition2(map){
    this.getLocation().then((data: any) => {
      // const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      //   center: {lat: data.lat, lng: data.long},
      //   zoom: 18,
      //   mapTypeControlOptions: {
      //     mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
      //   }, // here´s the array of controls
      //   disableDefaultUI: true, // a way to quickly hide all controls
      //   mapTypeControl: false,
      //   fullscreenControlOptions: false,
      //   panControl: false,
      //   streetViewControl: false,
      //   // scaleControl: true,
      //   // zoomControl: true,
      //   zoomControlOptions: {
      //     style: google.maps.ZoomControlStyle.LARGE 
      //   },
      //   mapTypeId: google.maps.MapTypeId.ROADMAP
      // });

      // this.map = map;

      const pos = {
        lat: data.lat,
        lng: data.long
      };

      // const infowindow = new google.maps.InfoWindow();
      // const infowindowContent = document.getElementById('infowindow-content');

      // infowindow.setContent(infowindowContent);

      const icon = {
        url: 'http://res.cloudinary.com/tapsy/image/upload/v1572870098/u_fzktfv.png', // image url
        scaledSize: new google.maps.Size(50, 50), // scaled size
      };

      const marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Tapsy',
        icon: icon
      });      

      marker.setVisible(true);

      // const contentString = '<div id="content">' +
      //     '<div id="siteNotice">' +
      //     '</div>' +
      //     '<h5 id="firstHeading" class="firstHeading">Tapsy</h5>' +
      //     '<div id="bodyContent">' +
      //     '<p>Location Testing</p>' +
      //     '<p>lorem ipsam</p>' +
      //     '</div>' +
      //     '</div>';


      // const infoWindow = new google.maps.InfoWindow;

      // infoWindow.setPosition(pos, marker);
      // // infoWindow.setContent(contentString);

      // this.autoComplete(data.lat, data.long);
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
          // localStorage.setItem('LOC_DATA', this.helper.encryptData(cus_location));
          resolve(cus_location);
        }  
      }).catch((error) => {
        console.log('Error getting location', error);
        reject(error);
      });
    })    
  }






  autoComplete(lat, long) {
    console.log('Auto complete lat, long: ', lat, long);
    
    const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      center: {lat: lat, lng: long},
      zoom: 18,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
      }, // here´s the array of controls
      disableDefaultUI: true, // a way to quickly hide all controls
      mapTypeControl: false,
      fullscreenControlOptions: false,
      panControl: false,
      streetViewControl: false,
      // scaleControl: true,
      // zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE 
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP
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

    var options = {
      // componentRestrictions: {country: "au"} //  <== Country code name
    };

    const autocomplete = new google.maps.places.Autocomplete(this.inputNativeElement.nativeElement as HTMLInputElement, options);
    autocomplete.addListener('place_changed', () => {
      infowindow.close();
      marker.setVisible(false);
      const place = autocomplete.getPlace();

      let cus_location = {
        lat: place.geometry.location.lat(),
        long: place.geometry.location.lng()
      }

      this.apiService.getPlaceInfoFromCoords(place.geometry.location.lat(), place.geometry.location.lng()).subscribe(data => {
        console.log('location info :.......', data.results[0].formatted_address); 

        this.search_location = data.results[0].formatted_address;  
        let encryptedData = this.helper.encryptData(this.search_location);          
        localStorage.setItem('cus_address', encryptedData);  

      }, error => {
        console.log('location info error :.......', error); 
      }); 

      console.log('place data :................', cus_location); 
      localStorage.setItem('LOC_DATA', this.helper.encryptData(cus_location));

      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        // window.alert('No details available for input: ' + place.name );
        return;
      }

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(16);  // Why 17? Because it looks good.
      }

      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
      let address = '';

      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      if(infowindowContent){
        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
      } 

      infowindow.open(map, marker);
      this.goToVendorSearch();
    });

  }





  goToVendorSearch() {
    setTimeout(() => {
      this.route.navigate([`search-vendor`]);
    }, 2000);    
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
  // }



  updatePaymentDetailsWithChargeId() {
    this.showLoader = false;

    let jobData = this.helper.getJobData();
    let charge = this.helper.chargeIdData();

    let paymentUpdatePayload = {
      job_id: jobData.id,
      updateData: {
        charge_id: charge.data
      }
    }

    this.apiService.updatePaymentDetails(paymentUpdatePayload).subscribe(async (data) =>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypt data :............', decrypted); 
        if(decrypted.status){
          console.log('payment data :............', decrypted.msg);
          // this.goToLocation();
          this.showLoader = false;
        }else{
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
          toast.present();
        }
      }
    },error => {
      console.log('####### err', error);
      this.showLoader = false;
    });

  }





  getItemNameAsSubcategoryChoosed() {
    this.helper.getSubCategoryFromLocal().then(data => {
      console.log('subCat details : ', data);

      if(data && data.name === 'residential locksmith'){
        this.itemName = 'house';
      }else if(data && data.name === 'automotive locksmith'){
        this.itemName = 'car';
      }
    }).catch(err => {
      console.log('error : ', err);
    });    
  }





  locationUpdateInterval(){
    this.setIntervalForUpdateLoc = setInterval(() => {
      // this.updateLocationInfo();
      this.setMarkerOnCurrentPosition2(this.map);
    }, 30000);
  }


  

}
