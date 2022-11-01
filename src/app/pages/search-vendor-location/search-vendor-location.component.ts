import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/service/alert.service';
import { environment } from 'src/environments/environment';
// import { ApiService } from 'src/app/service/api.service';
declare var google;

@Component({
  selector: 'app-search-vendor-location',
  templateUrl: './search-vendor-location.component.html',
  styleUrls: ['./search-vendor-location.component.scss'],
})
export class SearchVendorLocationComponent implements OnInit, OnDestroy {

  distanceService: any = new google.maps.DistanceMatrixService;

  @ViewChild('mapElement', {static: true}) mapNativeElement: ElementRef;

  latitude: any;
  longitude: any;
  sources: any[];
  destination: any[];
  vendorList: any;
  finalVendorArray: any;
  jobTimeOut: any;
  category: any;
  time: string;
  showLoader: boolean = false;
  title: any;
  serviceImage: any;
  baseImageUrl: string = environment.baseImageUrl;
  jobAccTimeOut: any;
  jobAcceptanceTimeOut: number;

  constructor(
    private geolocation: Geolocation, 
    private helper: HelpermethodsService,
    private route: Router,
    private apiService: ApiService,
    private toast: ToasterService,
    private alert: AlertService,
    ) { 

      

    }



    timeOutForJobAcceptance(){

      this.jobAccTimeOut = setInterval(()=> {
        // console.log(this.time); 
            let vendors = this.helper.getSortedVendorList();
            this.helper.deleteFirstVendorFromTheListAndSave(vendors);

            setTimeout(() => {
              let updatedVendonList = this.helper.getSortedVendorList();
              this.sendJobNotificationToVendors(updatedVendonList); 
            }, 1500); 
            // let toast = await this.toast.presentToast(data.title, data.body, "primary", 6000);
            // toast.present();      
      }, 23000);

    }



    ionViewWillEnter(){
      this.sharedDataSubscription();
      this.getCurrentLocation();
      this.getServiceDetailsFromLocal();
    }


  ngOnInit() {
    this.jobUpdateWithAddress();
    this.getCategoryName();
    this.startCountDownForSearchVendor();
  }



  sharedDataSubscription(){
    this.helper.currentMessage.subscribe((data:any) => {
      if(data) {
        let sharedData = JSON.parse(data);
        if(sharedData.vendorListUpdated) {
          let updatedVendonList = this.helper.getSortedVendorList();
          this.sendJobNotificationToVendors(updatedVendonList);
          this.helper.changeMessage('');
        }
      }
    });
  }



  ngOnDestroy(){
    this.stopTimeoutFunction(this.jobTimeOut);
    clearInterval(this.jobAccTimeOut);
  }



  ionViewDidLeave(){
    this.stopTimeoutFunction(this.jobTimeOut);
    clearInterval(this.jobAccTimeOut);
  }



  getServiceDetailsFromLocal() {
    this.helper.getServiceDetailsFromLocal().then((data: any) => {
      // console.log('service details :........................', data); 
      this.title = data.name; 
      this.serviceImage = data.image;
      this.showLoader = false;   
    }).catch(err => {
      // console.log('service details error:........................', err);
      this.showLoader = false;
    })
  }



  async getCurrentLocation() {
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((resp) => {
      // console.log('location responce data :...............', resp);

      let cus_location = {
        lat: resp.coords.latitude,
        long: resp.coords.longitude,
      }
      
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        center: {
          lat: this.latitude, 
          lng: this.longitude
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


    // this.goToTrackVendor();
    this.getVendorListForLocate().then((data: any) => {
      console.log('SUCCESS ################################################', data);
      this.getDistance(data.o, data.d);
    }).catch(err => {
      console.log('FAIL ################################################', err);
    });
        

    // this.sendNotification();
  }





  goToTrackVendor() {
    setTimeout(() => {
      this.route.navigate([`track-vendor`]);
    }, 10000);    
  }





  async getVendorListForLocate() {

    let category = await this.helper.getCategoryFromLocal();
    let location = await this.helper.getLocationData();

    let payload = {
      category_id: category.category_id
    };

    this.sources = [];
    this.destination = [];

    console.log('body data and location :.............', payload, location);    

    return new Promise((resolve, reject)=>{

      this.apiService.searchForNearByVendors(payload).subscribe( async (data: any) => {
        if(data && data.TAP_RES) {
          let decrypted = this.helper.decryptResponceData(data.TAP_RES);
          console.log('near by vendor data :..............................', decrypted);
          if(decrypted.status){
            // console.log('vendor list data :..............................', decrypted.data[0].conn_details);
            this.vendorList = decrypted.data;
            if(decrypted.data.length > 0){
              decrypted.data.forEach(element => {
                // console.log(element.latitude, element.longitude); 
                if(element.conn_details){
                  let destination = new google.maps.LatLng(element.conn_details.latitude, element.conn_details.longitude);
                  let origin = new google.maps.LatLng(location.lat, location.long);
                  this.sources.push(origin); 
                  this.destination.push(destination);
                }               
                 
              });
  
              resolve({
                o: this.sources,
                d: this.destination
              });
            }
          } else {
            // console.log('vendor list fetch error :..............................', decrypted);
            reject({
              o: false,
              d: false
            })
          }
        }
      })
    })

    

  }





  async getDistance(source, destination) {
    // this.distanceService.
    // var origin1 = new google.maps.LatLng(55.930385, -3.118425);
    let service: any = await this.helper.getServiceDetailsFromLocal();
    let userData: any = await this.helper.checkForUserData();
    console.log('######################   user data :............', userData);                                                                                                        
    let jobData: any = this.helper.getJobData();
    let loc: any = this.helper.getLocationData();
    let isJobScheduled = localStorage.getItem('isJobScheduled');

    console.log('service name and user data for push notification :.............', service, userData);    

    this.distanceService.getDistanceMatrix({
      origins: source,
      destinations: destination,
      travelMode: 'DRIVING'
    }, async (response, status) => {
      console.log('#########  getDistance(source, destination) responce #########', response.rows[0].elements);
      console.log('#########  getDistance(source, destination) responce ######### ----- ', status);

      //checking if array length is greater than one
      if(response.rows[0].elements && response.rows[0].elements.length > 0){

        let distArr = response.rows[0].elements.filter((item)=> {
          if(item.status && item.status != 'ZERO_RESULTS') {
            return item;
          }
        });

        if(distArr.length < 1) {
          this.getDistanceForWalking(source, destination);
        }else{


          this.getDistanceArrayFromRawArrayData(response.rows[0].elements).then(data => {
            // console.log('##############  logging vendor list sorted : ', data);
    
            // alert('eligible vendor list : '+ JSON.stringify(data));
            let datetime:any = this.getStartTime();
            let end_time = this.getEndTime(datetime, 21);

            this.jobUpdateWithStartAndEndTime(datetime);
            let encryptedData = this.helper.encryptData(data);          
            localStorage.setItem('vendor_list_data', encryptedData);
    
            let scheduled = null;
            if(isJobScheduled == 'true'){
              scheduled = 'true';
            }else if(isJobScheduled == 'false'){
              scheduled = 'false';
            }
    
            if(userData.name == null){
              userData.name = '';
            }
    
              let payload = {
                id: data[0].vendor_id.toString(),
                additionData: {
                  type: 'order_proposal',
                  job_type: service.name,
                  cus_id: userData.id.toString(),
                  cus_name: userData.name,
                  cus_phone: userData.phone.toString(),
                  address: this.helper.getCustomerAddress(),
                  lat: loc.lat.toString(),
                  long: loc.long.toString(),
                  distance: data[0].distance.toString(),
                  charge_id: this.helper.chargeIdData().data,
                  job_id: jobData.id.toString(),
                  isScheduled: scheduled,
                  start_time: `${datetime.hour}:${datetime.min}:${datetime.second}`,
                  end_time: `${end_time.h}:${end_time.m}:${end_time.s}`,
                  title: 'New Job',
                  body: 'You have a new job proposal'
                } 
              }
              
    
            console.log('payload data for notification : ......', payload);          
              // alert('notification sending to  '+ data[0].vendor_id + ' '+ userData.name);
    
              // clearInterval(this.jobAccTimeOut);
            this.apiService.sendPushNotification(payload).subscribe((data: any) => {    
              if(data && data.TAP_RES) {
                let decrypted = this.helper.decryptResponceData(data.TAP_RES);
                // console.log('decrypted data :..............................', decrypted);
                if(decrypted.status) {
                  console.log('send push responce', decrypted); 
                  this.timeOutForJobAcceptance();
                   
                  // alert('push notification sent successfully');        
                }else {
                  console.log('send push error responce', decrypted);
                  // alert('push notification sent ERROR');
                }
              }         
            });
    
          }).catch( async err =>{
            console.log('##############  vendor list sorted err : ', err);
    
            let toast = await this.toast.presentToast('Error!', "Sorry, No vendor found", "danger", 5000); 
              toast.present();
              this.stopTimeoutFunction(this.jobTimeOut);
              this.stopTimeoutFunction(this.jobAccTimeOut);
              this.route.navigate(['category']);
          });
        }
      }else{
        this.getDistanceForWalking(source, destination);
      }  

      // if(response.rows[0].elements && response.rows[0].elements.length > 0){
      //   if(response.rows[0].elements[0].status == "ZERO_RESULTS"){
      //     this.getDistanceForWalking(source, destination);
      //     return;
      //   }
      // }

           

      // let toast = await this.toast.presentToast('Success!', 'Distance calculated successfully ' + response.rows[0].elements[0].distance.text, "success", 5000); 
      // toast.present(); 

      // if (status == 'OK') {
      //   that.directionsDisplay.setDirections(response);
      //   this.getDistance(response.geocoded_waypoints[0].place_id, response.geocoded_waypoints[1].place_id);
      // } else {
      //   window.alert('Directions request failed due to ' + status);
      })
    };






    async getDistanceForWalking(source, destination) {
      console.log('### getDistanceForWalking (source, destination)  get distance method called :.............'); 
      // this.distanceService.
      // var origin1 = new google.maps.LatLng(55.930385, -3.118425);
      let service: any = await this.helper.getServiceDetailsFromLocal();
      let userData: any = await this.helper.checkForUserData();
      let jobData: any = this.helper.getJobData();
      let isJobScheduled = localStorage.getItem('isJobScheduled');
  
      // console.log('service name and user data for push notification :.............', service, userData);    
  
      this.distanceService.getDistanceMatrix({
        origins: source,
        destinations: destination,
        travelMode: 'WALKING'
      }, async (response, status) => {
        console.log('#########  getDistanceForWalking(source, destination) responce #########', response.rows[0].elements);
        console.log('#########  getDistanceForWalking(source, destination) responce ######### ----- ', status);

        if(response.rows[0].elements && response.rows[0].elements.length > 0){

          let distArr = response.rows[0].elements.filter((item)=> {
            if(item.status && item.status != 'ZERO_RESULTS') {
              return item;
            }
          });

          if(distArr.length < 1) {
            let toast = await this.toast.presentToast('Error!', "Sorry, No vendor found", "danger", 5000);  toast.present(); 
            this.stopTimeoutFunction(this.jobTimeOut);
            this.stopTimeoutFunction(this.jobAccTimeOut);
            this.route.navigate(['category']);
          }else{
            
            this.getDistanceArrayFromRawArrayData(response.rows[0].elements).then(data => {
              console.log('############## getDistanceForWalking logging vendor list sorted by distance : ', data);

              let datetime:any = this.getStartTime();
              let end_time = this.getEndTime(datetime, 21);
              this.jobUpdateWithStartAndEndTime(datetime);

              let encryptedData = this.helper.encryptData(data);          
              localStorage.setItem('vendor_list_data', encryptedData);
    
              let scheduled = null;
            if(isJobScheduled == 'true'){
              scheduled = 'true';
            }else if(isJobScheduled == 'false'){
              scheduled = 'false';
            }
      
              if(userData.name == null){
                userData.name = '';
              }
      
                let payload = {
                  id: data[0].vendor_id,
                  additionData: {
                    type: 'order_proposal',
                    job_type: service.name,
                    cus_id: userData.id.toString(),
                    cus_name: userData.name,
                    address: this.helper.getCustomerAddress(),
                    lat: this.helper.getLocationData().lat.toString(),
                    long: this.helper.getLocationData().long.toString(),
                    distance: data[0].distance.toString(),
                    job_id: jobData.id.toString(),
                    charge_id: this.helper.chargeIdData().data,
                    isScheduled: scheduled,
                    start_time: `${datetime.hour}:${datetime.min}:${datetime.second}`,
                    end_time: `${end_time.h}:${end_time.m}:${end_time.s}`,
                    title: 'New Job',
                    body: 'You have a new job proposal'
                  } 
                }
      
                  console.log('payload data for notification : ......', payload);          
                  // clearInterval(this.jobAccTimeOut);
      
              this.apiService.sendPushNotification(payload).subscribe((data: any) => {    
                if(data && data.TAP_RES) {
                  let decrypted = this.helper.decryptResponceData(data.TAP_RES);
                  console.log('##### decrypted data :..............................', decrypted);
                  if(decrypted.status) {
                    this.timeOutForJobAcceptance();
                    // console.log('send push responce', decrypted);          
                  }else {
                    // console.log('send push error responce', decrypted);
                  }
                }         
              });
      
            }).catch( async err =>{
              console.log('##############  vendor list sorted by distance error: ', err);
              let toast = await this.toast.presentToast('Error!', "Sorry, No vendor found", "danger", 5000);  toast.present(); 
                this.stopTimeoutFunction(this.jobTimeOut);
                this.stopTimeoutFunction(this.jobAccTimeOut);
                this.route.navigate(['category']);
            });
          }
        }else{
          let toast = await this.toast.presentToast('Error!', "Sorry, No vendor found", "danger", 5000);  toast.present(); 
          this.stopTimeoutFunction(this.jobTimeOut);
          this.stopTimeoutFunction(this.jobAccTimeOut);
          this.route.navigate(['category']);
        }
  
        // if(response.rows[0].elements && response.rows[0].elements.length > 0){
        //   if(response.rows[0].elements[0].status == "ZERO_RESULTS"){
        //     let toast = await this.toast.presentToast('Error!', "Please provide a valid address", "danger", 5000); 
        //   toast.present(); 
        //     this.stopTimeoutFunction(this.jobTimeOut);
        //     this.stopTimeoutFunction(this.jobAccTimeOut);
        //     this.route.navigate(['category']);
        //     return;
        //   }
        // }

             
  
        // let toast = await this.toast.presentToast('Success!', 'Distance calculated successfully ' + response.rows[0].elements[0].distance.text, "success", 5000); 
        // toast.present(); 
  
        // if (status == 'OK') {
        //   that.directionsDisplay.setDirections(response);
        //   this.getDistance(response.geocoded_waypoints[0].place_id, response.geocoded_waypoints[1].place_id);
        // } else {
        //   window.alert('Directions request failed due to ' + status);
        })
      };






    getDistanceArrayFromRawArrayData(arr) {
      // alert('unfiltered arr :...'+ JSON.stringify(arr));
      return new Promise((resolve, reject)=>{
        let vendorDataLength = this.vendorList.length;
        let finalVendorArray = [];

        arr.forEach((item, index) => {

          if(index < vendorDataLength){
            if(item.distance){

              let num = item.distance.text.split(' ');
              let value = item.distance.value;
              num = num[0].replace (/,/g, "");
              num = parseInt(num, 10);

              // distance: {text: "4.5 km", value: 4504}
              // duration: {text: "13 mins", value: 792}

              if(value < 25000){
                let obj = {
                  distance: num,
                  vendor_id: this.vendorList[index].id
                }  
                finalVendorArray.push(obj);
              }
  
              
            }
          }          
             
        });

        if(finalVendorArray.length > 0){
          // alert('filter arr :...'+ JSON.stringify(finalVendorArray));
          resolve(finalVendorArray.sort(this.sortObject('distance')));
        }else{
          reject('No vendor found');
        }        
      }); 
    }






  // |---------------------------------------------------------
  // |------- object sorting method -------
  // |---------------------------------------------------------
  sortObject(key, order = 'asc') {
    return function (a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = (typeof a[key] === 'string') ?
        a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ?
        b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order == 'desc') ? (comparison * -1) : comparison
      );
    };
  }






  // sendNotification(){

  //   let payload = {
  //     id: 43,
  //     additionData: {
  //       job_type: 'Residential lock change',
  //       cus_id: '123456',
  //       address: 'dfs sdfsdf sdfsdf 12345',
  //       distance: '21 kms'
  //     } 
  //   }

  //   this.apiService.sendPushNotification(payload).subscribe((data)=>{
  //     console.log('push send status :.................', data);      
  //   })
  // }




  async sendJobNotificationToVendors(data) {

    // this.stopTimeoutFunction(this.jobTimeOut);
    // alert('trying to send to second vendor');
    if(data.length < 1){
      clearInterval(this.jobAccTimeOut);
      this.stopTimeoutFunction(this.jobTimeOut);
      this.setTimeOutForJobAcceptance();
      return;
    }

    let service: any = await this.helper.getServiceDetailsFromLocal();
    let userData: any = await this.helper.checkForUserData();
    let jobData: any = this.helper.getJobData();
    let loc: any = this.helper.getLocationData();
    let isJobScheduled = localStorage.getItem('isJobScheduled');

    let datetime:any = this.getStartTime();
    let end_time = this.getEndTime(datetime, 21);

    let scheduled = null;
        if(isJobScheduled == 'true'){
          scheduled = 'true';
        }else if(isJobScheduled == 'false'){
          scheduled = 'false';
        }

    if(userData.name == null){
      userData.name = '';
    }

    let payload = {
      id: data[0].vendor_id.toString(),
      additionData: {
        type: 'order_proposal',
        job_type: service.name,
        cus_id: userData.id.toString(),
        address: this.helper.getCustomerAddress(),
        distance: data[0].distance.toString(),
        job_id: jobData.id.toString(),
        charge_id: this.helper.chargeIdData().data,
        isScheduled: scheduled,
        start_time: `${datetime.hour}:${datetime.min}:${datetime.second}`,
        end_time: `${end_time.h}:${end_time.m}:${end_time.s}`,
        title: 'New Job',
        body: 'You have a new job proposal',
        cus_name: userData.name,
        cus_phone: userData.phone.toString(),
        lat: loc.lat.toString(),
        long: loc.long.toString()
      } 
    }

    console.log('payload data for notification : ......', payload);          
    clearInterval(this.jobAccTimeOut);

    this.apiService.sendPushNotification(payload).subscribe((data: any) => {    
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);
        if(decrypted.status) {
          this.timeOutForJobAcceptance();
          
          console.log('send push responce', decrypted);
          // alert('notification send success');          
        }else {
          console.log('send push error responce', decrypted);
          // alert('notification send fail');
        }
      }         
    });

  }






  async setTimeOutForJobAcceptance() {

    this.stopTimeoutFunction(this.jobTimeOut);
    this.stopTimeoutFunction(this.jobAccTimeOut);

      this.showLoader = true;
      let jobData: any = this.helper.getJobData();
      let charge = this.helper.chargeIdData();

      let payload = {
        id: jobData.id, 
        updateData: {
          job_status: 3
        }
      }

      this.apiService.updateJobs(payload).subscribe(data => {
        if(data && data.TAP_RES) {
          let decrypted = this.helper.decryptResponceData(data.TAP_RES);
          // console.log('updateJobs data :..............................', decrypted);

          if(decrypted.status) {
            
            console.log('updateJobs responce', decrypted); 
            let payload1 = {
              charge_id: charge.data
            };
      
            this.apiService.getRefund(payload1).subscribe(async (data) => {
              if(data && data.TAP_RES) {
                let decrypted = this.helper.decryptResponceData(data.TAP_RES);
                console.log('decrypted data :..............................', decrypted);
                if(decrypted.status) {
              
                  const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, Vendor not found');
                  alert.present();
                  this.helper.removeJobRelatedLocalData();
                  this.route.navigate([`category`]);
                  this.showLoader = false;         
                }else {
                  this.showLoader = false;
                  console.log('getRefund error responce', decrypted);
                }
              }
            },error=>{
              this.showLoader = false;
              console.log('getRefund error responce', error);
            });         
          }else {
            this.showLoader = false;
            console.log('updateJobs error responce', decrypted);
          }
        }
      }, error=>{
        this.showLoader = false;
        console.log('updateJobs error responce', error);
      });
  }






  stopTimeoutFunction(timeout) {
    clearInterval(timeout);
  }





  async getCategoryName(){
    this.category = await this.helper.getCategoryFromLocal();
  }




  startCountDownForSearchVendor() {
    this.time = '80';

    this.jobTimeOut = setInterval(()=>{
      if(parseInt(this.time) > 0) {
        let decresedTime = parseInt(this.time) - 1;
        this.time = decresedTime.toString();
        // if(this.time.length == 1){
        //   this.time = `0${this.time}`;
        // }
      }else if(parseInt(this.time) == 0) {
        this.stopTimeoutFunction(this.jobTimeOut);
        this.stopTimeoutFunction(this.jobAccTimeOut);
        this.setTimeOutForJobAcceptance();
      }      
      // console.log(this.time);      
    }, 1000);

  }







  jobUpdateWithAddress() {

    this.showLoader = false;
    let jobData = this.helper.getJobData();
    

    let jobUpdatePayload = {
      id: jobData.id,
      updateData: {
        address: this.helper.getCustomerAddress()
      }
    }
  

    this.apiService.updateJobs(jobUpdatePayload).subscribe(async (data) =>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypt data :............', decrypted); 
        if(decrypted.status){
          this.showLoader = false;
        }else{
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
          toast.present();
        }
      }
    },async (error) => {
      let toast = await this.toast.presentToast('Error!', 'Something went wrong.', "danger", 5000); 
      toast.present();
      this.showLoader = false;
    });
  }








  jobUpdateWithStartAndEndTime(datetime) {

    // this.showLoader = false;
    let jobData = this.helper.getJobData();
    // let datetime: any = this.getStartTime();
    let end_time = this.getEndTime(datetime, 21);

    let jobUpdatePayload = {
      id: jobData.id,
      updateData: {
        job_accept_start_time: `${datetime.hour}:${datetime.min}:${datetime.second}`,
        job_accept_end_time: `${end_time.h}:${end_time.m}:${end_time.s}`
      }
    }
  

    this.apiService.updateJobs(jobUpdatePayload).subscribe(async (data) =>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        console.log('decrypt data :............', decrypted); 
        if(decrypted.status){
          this.showLoader = false;
        }else{
          this.showLoader = false;
          // let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
          // toast.present();
        }
      }
    },async (error) => {
      // let toast = await this.toast.presentToast('Error!', 'Something went wrong.', "danger", 5000); 
      // toast.present();
      this.showLoader = false;
    });
  }







  getStartTime(){
    let date = new Date();
    // let dMnY = helper.getDateFormatDMnY(date);
    let offset = date.getTimezoneOffset() * 60 * 1000;
    let localTime = date.getTime();
    let utcTime = localTime + offset;
    let customOffset = 10;
    let austratia_brisbane = utcTime + (3600000 * customOffset);
    let customDate = new Date(austratia_brisbane);

    let data = {
        day: customDate.getDate(),
        month: customDate.getMonth() + 1,
        year: customDate.getFullYear(),
        hour: customDate.getHours(),
        min: customDate.getMinutes(),
        second: customDate.getSeconds(),
        raw: customDate,
        stringDate: customDate.toString()
    }

    return data;
  }






  getEndTime(starttime, diff){

    let h;
    let m;
    let s;
    var data;

    if(starttime){
      s = parseInt(starttime.second) + parseInt(diff);

      if(parseInt(s) < 60){
        data = {
          h: starttime.hour,
          m: starttime.min,
          s: s
        }
      }


      if(parseInt(s) == 60){
        m = parseInt(starttime.min) + 1;
        if(parseInt(m) < 60){
          data = {
            h: starttime.hour,
            m: m,
            s: '00'
          }
        } 
        
        if(parseInt(m) == 60){
          data = {
            h: parseInt(starttime.hour)+1,
            m: '00',
            s: '00'
          }
        }
      }


      if(parseInt(s) > 60){
        m = parseInt(starttime.min) + 1;
        if(parseInt(m) < 60){
          data = {
            h: starttime.hour,
            m: m,
            s: parseInt(s) - 60
          }
        } 
        
        if(parseInt(m) == 60){
          data = {
            h: parseInt(starttime.hour)+1,
            m: '00',
            s: parseInt(s) - 60
          }
        }
      }


      return data;
    }
  }







  






  



}
