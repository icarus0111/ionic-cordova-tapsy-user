import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
declare var google;

@Component({
  selector: 'app-tracking-vendor',
  templateUrl: './tracking-vendor.component.html',
  styleUrls: ['./tracking-vendor.component.scss'],
})
export class TrackingVendorComponent implements OnInit, OnDestroy {

  @ViewChild('mapElement', {static: true}) mapNativeElement: ElementRef;

  directionsService: any = new google.maps.DirectionsService;
  directionsDisplay: any = new google.maps.DirectionsRenderer({polylineOptions: {
    strokeColor: "blue"
  }});
  distanceService: any = new google.maps.DistanceMatrixService;

  latitude: any;
  longitude: any;
  acceptVendorData: { data: any; status: boolean; };

  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;
  isTracking: boolean;
  categary: any;
  service: any;
  showLoader: boolean;
  updatedLat: any;
  updatedLong: any;
  setFirstDirection: boolean;
  insterval: any;
  distanceInt: any;
  title: any;
  serviceImage: any;
  baseImageUrl: string = environment.baseImageUrl;
  locationSubscription: any;

  constructor(
    private geolocation: Geolocation, 
    private helper: HelpermethodsService,
    private apiService: ApiService,
    private route: Router,
    private toast: ToasterService,
    private afs: AngularFirestore,
    private callNumber: CallNumber,
    private cdr: ChangeDetectorRef,
    public alertController: AlertController
  ) { 

    this.helper.currentMessage.subscribe(data => {
      if(data){
        let msg = JSON.parse(data);
        if(msg.vendor_arrived){
          this.cdr.detectChanges();
          this.helper.changeMessage('');
        }
      }
    });
    
  }



  ionViewWillEnter() {
    this.renderInitMapForDirection();
  }

  

  ngOnInit() {
    // this.setMarkerOnCurrentPosition();    
    this.getCategory();
    this.setJobGoingOnFlag();
    this.getServiceDetailsFromLocal();
  }


  ngOnDestroy(){
    clearInterval(this.insterval);
    clearInterval(this.distanceInt);
    this.locationSubscription.unsubscribe();
  }



  ionViewDidLeave(){
    clearInterval(this.insterval);
    clearInterval(this.distanceInt);
    this.locationSubscription.unsubscribe();
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



  setMarkerOnCurrentPosition() {
    // this.helper.getLocationDataWithPromise().then((data: any) => {
      const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        center: {lat: -33.8688, lng: 151.2093},
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
        lat: -33.8688,
        lng: 151.2093
      };

      const infowindow = new google.maps.InfoWindow();
      const infowindowContent = document.getElementById('infowindow-content');

      infowindow.setContent(infowindowContent);

      const icon = {
        url: 'http://res.cloudinary.com/tapsy/image/upload/v1572870098/u_fzktfv.png', // image url
        scaledSize: new google.maps.Size(30, 30), // scaled size
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

      // this.autoComplete(data.lat, data.long);
      // this.getLocationDataAndUpdateMap(map);

      this.renderInitMapForDirection();
    // }).catch(err => {
    //   console.log(err);      
    // })
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



  renderInitMapForDirection() {
    console.log('########  render init map called.....');    
    localStorage.setItem('istrackstarted', 'true');

    // let loc_data = this.helper.getLocationData();
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
      // zoomControlOptions: {
      //   style: google.maps.ZoomControlStyle.LARGE 
      // },
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    this.cdr.detectChanges();
    
    this.directionsDisplay.setMap(map);
    this.getLocationDataAndUpdateMap();
  }




  getDirection(dlt, dlng) {
    // calculateAndDisplayRoute(formValues) {
      console.log('##########   getDirection(map, dlt, dlng) called..........');  
      this.getOriginAndDestinationForTracking(dlt, dlng).then(data => {
        this.directionsService.route({
          origin: data.origin,
          destination: data.destination,
          travelMode: 'DRIVING'
        }, async (response, status) => {
          console.log('get direction responce :.........................', response);        
          if (status == 'OK') {
            console.log('get direction responce is OK:.........................', response);  
            this.directionsDisplay.setDirections(response);
            // this.markerStartEnd(map, data.origin, data.destination);
            // this.cdr.detectChanges();
            // this.getDistance(response.request.origin.query, response.request.destination.query);
          } else {
            // let toast = await this.toast.presentToast('Success!', 'Directions request failed due to ' + status, "danger", 5000); 
            // toast.present();
            console.log('get direction responce is NOT OK for driving:.........................', response);
            this.getDirectionForWalking(dlt, dlng);
          }
        });
      }).catch(async err =>{
        localStorage.removeItem('istrackstarted');
        this.showLoader = false;
        // await this.toast.showSuccess('Success!', "Sorry, Didn't found any route");
        let toast = await this.toast.presentToast('Error!', "Sorry, Didn't found any route", "danger", 5000); 
        toast.present();
        this.route.navigate(['category']);
      });    
  }




  getDirectionForWalking(dlt, dlng) {
    // this.showLoader = true;
  // calculateAndDisplayRoute(formValues) {
    console.log(' ##### travel with walking mode called ........', dlt, dlng);
    console.log(' ##### vendor lat long ........', dlt, dlng);
      
    this.getOriginAndDestinationForTracking(dlt, dlng).then(data => {
      this.directionsService.route({
        origin: data.origin,
        destination: data.destination,
        travelMode: 'WALKING'
      }, async (response, status) => {
        console.log('#### direction responce walking mode :.........................', response);        
        if (status == 'OK') {
          this.showLoader = false;
          this.directionsDisplay.setDirections(response);
          this.getDistance(response.request.origin.query, response.request.destination.query);
        } else {
          localStorage.removeItem('istrackstarted');
          this.showLoader = false;
          // await this.toast.showSuccess('Success!', 'Directions request failed due to ' + status);            
          let toast = await this.toast.presentToast('Error!', 'Please, Not found any valid route', "danger", 5000); 
          toast.present(); 
          this.route.navigate(['category']);          
        }
      });
    }).catch(async err => {
      localStorage.removeItem('istrackstarted');
      this.showLoader = false;
      // await this.toast.showSuccess('Success!', "Sorry, Didn't found any route");
      let toast = await this.toast.presentToast('Error!', "Sorry, Didn't found any route", "danger", 5000); 
      toast.present();
      this.route.navigate(['category']);
    });    
}




  getDistance(source, destination) {
    // this.distanceService.
    // var origin1 = new google.maps.LatLng(55.930385, -3.118425);
    this.distanceService.getDistanceMatrix({
      origins: [source],
      destinations: [destination],
      travelMode: 'DRIVING'
    }, async (response, status) => {
      console.log('#########  Distance  #########', response);

      // let toast = await this.toast.presentToast('Success!', 'Distance calculated successfully ' + response.rows[0].elements[0].distance.text, "success", 5000); 
      // toast.present(); 

      // if (status == 'OK') {
      //   that.directionsDisplay.setDirections(response);
      //   this.getDistance(response.geocoded_waypoints[0].place_id, response.geocoded_waypoints[1].place_id);
      // } else {
      //   window.alert('Directions request failed due to ' + status);
      // }
    });
    // this.goToPaymentPage();
  }






  // goToPaymentPage() {
  //   setTimeout(() => {
  //     this.route.navigate([`payment`]);
  //   }, 10000);    
  // }



  getAcceptVendorData(){
    this.acceptVendorData = this.helper.getAcceptVendorData();
    // console.log('accept vendor data :..................'+ JSON.stringify(this.acceptVendorData));    
    if(this.acceptVendorData.status){
      return this.acceptVendorData.data[0];
    }else{
      return null;
    };
  }




  async getOriginAndDestinationForTracking(destLat, destLong){
    let origin = this.helper.getLocationData();
    console.log('########   origin data :.........', origin);    
    return {
      origin: new google.maps.LatLng(origin.lat, origin.long),
      destination: new google.maps.LatLng(destLat, destLong)
      // origin: new google.maps.LatLng(22.726156, 88.474960),
      // destination: new google.maps.LatLng(22.641791, 88.43146)
    }
  }






  // Perform an anonymous login and load data
  getLocationDataAndUpdateMap() {

    console.log('###################  getLocationDataAndUpdateMap(map) called........');
    this.setFirstDirection = true;
    // this.afAuth.auth.signInAnonymously().then(res => {
      let user_id = this.getAcceptVendorData().id;
      // console.log('accept vendor data :.............'+ JSON.stringify(this.getAcceptVendorData()));
      // console.log('accept vendor data :.............', this.getAcceptVendorData());

      
      this.locationsCollection = this.afs.collection(
        `locations/${user_id}/track`,
        ref => ref.orderBy('timestamp', 'desc').limit(1)
      );

 
      // Make sure we also get the Firebase item ID!
      this.locations = this.locationsCollection.snapshotChanges().pipe(
        map(actions =>
          actions.map((a: any) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );

 
      // Update Map marker on every change
      this.locationSubscription = this.locations.subscribe(locations => {

        if(locations[0]){
          if(locations[0].lat && locations[0].lng){
            this.updatedLat = locations[0].lat;
            this.updatedLong = locations[0].lng;
          }          
        }  
        
        if(this.setFirstDirection){
          this.getDirection(this.updatedLat, this.updatedLong);
          this.setFirstDirection = false;
        }
      });
    // });

    // this.startTracking();
        
    this.updatePosition();
  }





  updatePosition() {
    console.log('###################  updatePosition(map) called........');
    this.insterval = setInterval(()=> {
      this.getDirection(this.updatedLat, this.updatedLong);
    }, 5000);

    this.distanceInt = setInterval(()=> {
      this.getVendorDistance(this.updatedLat, this.updatedLong);
    }, 10000);
  }




  // Use Capacitor to track our geolocation
// startTracking() {
//   this.isTracking = true;
//   let watch = this.geolocation.watchPosition();

//   watch.subscribe((data) => {
//     // data can be a set of coordinates, or an error (if an error occurred).
//     // data.coords.latitude
//     // data.coords.longitude
//     console.log('watch data :.............', data); 

//     this.addNewLocation(
//       data.coords.latitude,
//       data.coords.longitude,
//       data.timestamp
//     );   
//   });

  // this.watch = this.geolocation.watchPosition({}, (position, err) => {
  //   if (position) {
  //     this.addNewLocation(
  //       position.coords.latitude,
  //       position.coords.longitude,
  //       position.timestamp
  //     );
  //   }
  // });
// }







 
// Unsubscribe from the geolocation watch using the initial ID
// stopTracking() {
//   Geolocation.clearWatch({ id: this.watch }).then(() => {
//     this.isTracking = false;
//   });
// }






 
// Save a new location to Firebase and center the map
addNewLocation(lat, lng, timestamp) {
  this.locationsCollection.add({
    lat,
    lng,
    timestamp
  });
 
  // let position = new google.maps.LatLng(lat, lng);
  // this.map.setCenter(position);
  // this.map.setZoom(5);
}




 
// Delete a location from Firebase
// deleteLocation(pos) {
//   this.locationsCollection.doc(pos.id).delete();
// }




 
// Redraw all markers on the map
// updateMap(locations) {
//   // Remove all current marker
//   this.markers.map(marker => marker.setMap(null));
//   this.markers = [];
 
//   for (let loc of locations) {
//     let latLng = new google.maps.LatLng(loc.lat, loc.lng);
 
//     let marker = new google.maps.Marker({
//       map: this.map,
//       animation: google.maps.Animation.DROP,
//       position: latLng
//     });
//     this.markers.push(marker);
//   }
// }



  getVendorArrivedData() {
    let arriveData = this.helper.getVendorArrivedData();
    if(arriveData.status){
      return true;
    }else{
      return false;
    }
  }




  async sendApproveNotification(){

    let userData: any = await this.helper.checkForUserData();
    let jobData: any = this.helper.getJobData();

    let payload = {
      id: this.getAcceptVendorData().id,
      additionData: {
        type: 'approve_job',
        cus_id: userData.id.toString(),
        job_id: jobData.id.toString(),
        title: 'Job Approved',
        body: 'Your job is approved'
      } 
    }

    console.log('payload data for notification : ......', payload);          

    this.apiService.sendPushNotification(payload).subscribe((data: any) => {    
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);
        if(decrypted.status) {
          console.log('send push responce', decrypted);
          // this.route.navigate(['success']);         
        }else {
          console.log('send push error responce', decrypted);
        }
      }         
    });


    // this.getPayment();
  }





  getPayment(){

    let charge_id = this.helper.chargeIdData().data;
    let payload = {
      charge_id: charge_id,
      // charge_id: 'ch_1FomtQGyJck0KUUW7yRWIoaX',
    }

    this.apiService.getPayment(payload).subscribe(async(data) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);
        if(decrypted.status) {
            let paymentData = decrypted.data;
            console.log('payment data :.........', paymentData);
            let jobData = this.helper.getJobData();
            this.sendApproveNotification();

            let paymentDetailsUpdateData = {
              job_id: jobData.id,
              updateData: {
                transaction_id: paymentData.balance_transaction,
                description: paymentData.description,
                payment_method: paymentData.payment_method,
                receipt_url: paymentData.receipt_url
              }
            }

            this.apiService.updatePaymentDetails(paymentDetailsUpdateData).subscribe(async (data) =>{
              if(data && data.TAP_RES) {
                let decrypted = this.helper.decryptResponceData(data.TAP_RES);
                // console.log('decrypt data :............', decrypted); 
                if(decrypted.status){
                  this.updatejobAsCompleted(jobData.id);                  
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

        }else {
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
          toast.present();
        }
      } 
    }, error => {
      console.log('####### err', error);
    });
  }





  updatejobAsCompleted(jobid){

    let payload = {
      id: jobid,
      updateData: {
        job_status: 2
      }
    }

    this.apiService.updateJobs(payload).subscribe(async(data)=>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        // console.log('decrypt data :............', decrypted); 
        if(decrypted.status){
          this.route.navigate(['success']); 
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





  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure to cancel the job?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            this.cancelJob();
          }
        }
      ]
    });

    await alert.present();
  }





  cancelJob() {
    localStorage.removeItem('istrackstarted');
    this.showLoader = true;

    let jobData = this.helper.getJobData();

    let payload = {
      id: jobData.id,
      updateData: {
        job_status: 3
      }
    }

    this.apiService.updateJobs(payload).subscribe(async(data)=> {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        // console.log('decrypt data :............', decrypted); 
        if(decrypted.status){
          clearInterval(this.insterval);
          clearInterval(this.distanceInt);
          this.sendCancelJobPushToVendor();
          // this.route.navigate(['category']); 
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





  async getCategory(){
    this.categary = await this.helper.getCategoryFromLocal();
    this.getService();
  }




  getService() {
    this.helper.getServiceDetailsFromLocal().then((data)=>{
      this.service = data;
    }).catch(err=>{
      console.log(err);
    });

    this.getAddress();
  }



  getAddress() {
    let addr = this.helper.getCustomerAddress();
    if(addr){
      return addr;
    }else{
      return 'Unit 2/360 Orange Grove Road, Salisbury...';
    }
  }




  // getAcceptVendorData() {
  //   this.acceptVendorData = this.helper.getAcceptVendorData();
  //   return this.acceptVendorData.status;
  // }



  async onClickCallIcon() {
    let vendorData: any = this.helper.getAcceptVendorData();

    if(vendorData && vendorData.status) {
      window.open(`tel:${vendorData.data[0].phone}`, '_system');
    }
  }





  getVendorDistance(dlt, dlng) {
    // console.log('get distance calleddddddddddddddddddddddddddddddddd..........');     
   this.getOriginAndDestinationForTracking(dlt, dlng).then(data => {

     this.distanceService.getDistanceMatrix({
       origins: [data.origin],
       destinations: [data.destination],
       travelMode: 'DRIVING'
     }, async (response, status) => {
       console.log('############ distance... ', response.rows[0].elements);
       // distance: {text: "1 m", value: 0}
       if(response.rows[0].elements && response.rows[0].elements.length > 0){
         let distanceDetails = response.rows[0].elements[0].distance;

         let arr = distanceDetails.text.split(' ');
         let num = arr[0].replace (/,/g, "");
         num = parseInt(num, 10);

         let unit = arr[1].trim();
         
         if(unit == 'm' && num < 30) {
           clearInterval(this.distanceInt);
           clearInterval(this.insterval);

           localStorage.removeItem('istrackstarted');
           this.route.navigate(['started-job']);
         }
       }
       
       })

   }).catch(err => {
     console.log(err);      
   });    
 }





  setJobGoingOnFlag(){
    let is_job_going = {
      status: true
    }

    let encryptedData = this.helper.encryptData(is_job_going);
    localStorage.setItem('is_job_going', encryptedData);
  }






 async sendCancelJobPushToVendor() {
    this.showLoader = true;
    let service: any = await this.helper.getServiceDetailsFromLocal();
    let userData: any = await this.helper.checkForUserData();
    let vendorData: any = await this.helper.getAcceptVendorData();

    console.log('################  vendor data : .................', vendorData);

    if(userData.name == null){
      userData.name = '';
    }
    
    let payload = {
      id: vendorData.data[0].id.toString(),
      additionData: {
        type: 'job_cancel',
        job_type: service.name,
        cus_id: userData.id.toString(),
        cus_name: userData.name,
        charge_id: this.helper.chargeIdData().data,
        title: 'Job Cancelled',
        body: 'Sorry! Customer have cancelled the job'
      } 
    }


    this.apiService.sendPushNotification(payload).subscribe((data: any) => {    
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        if(decrypted.status) {
          this.helper.removeJobRelatedLocalData();
          this.route.navigate(['category']); 
          this.showLoader = false;     
        }else {
          this.showLoader = false;
        }
      }         
    }, error => {
      this.showLoader = false;
    });


    clearInterval(this.insterval);
    clearInterval(this.distanceInt);


  }





  markerStartEnd(map, startPoint, endPoint) {
    var anchor = new google.maps.Point(20, 41),
      size = new google.maps.Size(41, 41),
      // origin = new google.maps.Point(0, 0),
      icon = new google.maps.MarkerImage('https://res.cloudinary.com/tapsy/image/upload/v1579779093/location_hloi3z.png', size, origin, anchor);

    new google.maps.Marker({
      icon: icon,
      map: map,
      position: startPoint
    });
    /* new google.maps.Label({
      position: startPoint,
      map: map,
      content: startTime
    }); */
  
    icon = new google.maps.MarkerImage('https://res.cloudinary.com/tapsy/image/upload/v1579779093/location_hloi3z.png', size, origin, anchor);

    new google.maps.Marker({
      icon: icon,
      map: map,
      position: endPoint
    });
    /* new google.maps.Label({
      position: endPoint,
      map: map,
      content: endTime
    }); */
  }



}
