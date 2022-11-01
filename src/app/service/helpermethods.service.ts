import { Injectable } from '@angular/core';
import * as CryptoJS from "crypto-js";
import { environment } from "../../environments/environment";
import { ToasterService } from './toaster.service';
// import { RouteGuard } from '../guard/route.guard';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelpermethodsService {

  // secret: string = "nPRCyH$3r0V1NwGm";
  fileData: File = null;
  image64: any = null;

  private messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();

  constructor(
    private toaster: ToasterService, 
    // private guard: RouteGuard, 
    private router: Router
    ) { }




  changeMessage(message: string) {
    this.messageSource.next(message)
  }




  encryptData(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), environment.encrySecret).toString();
    } catch (e) {
      console.log(e);
    }
  }
  

  decryptData(data) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, environment.encrySecret);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }


  async imageProgress(fileInput: any) {
    let fileData = <File>fileInput.target.files[0];
    console.log('this.fileData : ....................', fileData);    
    let returnData = await this.preview(fileData);
    return returnData;
  }


  async preview(fileData) {
    // Show preview 
    this.image64 = null;
    let mimeType = fileData.type;
    let arr = fileData.name.split('.');

    console.log('name array : ....................', arr);
    if (mimeType.match(/image\/*/) == null || fileData.size > 102400) {
      // this.toaster.showError('Upload image within 100 KB', 'Error!');
      return;
    }else if(arr[1].toLowerCase() !== 'png' && arr[1].toLowerCase() !== 'jpg' && arr[1].toLowerCase() !== 'jpeg') {
      // this.toaster.showError('Upload format should be PNG/JPG', 'Error!');
      return;
    }

    var reader = new FileReader();      
    reader.readAsDataURL(fileData); 
    return new Promise((resolve, reject)=>{
      reader.onload = (_event) => { 
        this.image64 = reader.result;       
        // console.log('this.image64 ### :.................', this.image64);  
        if(this.image64){
          resolve(this.image64);
        }else{
          reject();
        }           
      }
    })
    
    // console.log('this.image64 ### return :.................', this.image64);
    // return this.image64;
  }





  //-------------------------------------------------------------
  // encrypt request data
  //-------------------------------------------------------------
  encryptDataFromRequest(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), environment.encrySecretForRequest).toString();
    } catch (e) {
      console.log(e);
    }
  }



  //-------------------------------------------------------------
  //  decrypt responce data
  //-------------------------------------------------------------
  decryptResponceData(payload) {
    try {
        const bytes = CryptoJS.AES.decrypt(payload, environment.encrySecretForRequest);
        if (bytes.toString()) {
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        }
        return payload;
    } catch (e) {
        console.log(e);
    }
  }




  checkForUserData() {
    let localUserData = localStorage.getItem('user_data');
    let localTokenData = localStorage.getItem('token');
    if(localUserData && localTokenData) {
      let userData = this.decryptData(localUserData);
      if(userData.phone && userData.role_id && userData.id){
        return userData;
      }else{
        return false;
      }
    }else{
      return false;
    } 
  }





  getServiceDetailsFromLocal() {
    return new Promise((resolve, reject) => {


      let localServiceData = localStorage.getItem('service');
      // console.log('local service data :...............', localServiceData);    
      if(localServiceData) {
        let serviceData = this.decryptData(localServiceData);
        resolve(serviceData);
      }else{
        reject('Service data not found');
      }


    });    
  }





  async getCategoryFromLocal() {
    let localCategoryIdData = localStorage.getItem('category_id');
    if(localCategoryIdData) {
      return this.decryptData(localCategoryIdData);      
    }else{
      return false;
    }
  }




  async getSubCategoryFromLocal() {
    let localSubCategoryIdData = localStorage.getItem('sub_category_id');
    if(localSubCategoryIdData){
      return this.decryptData(localSubCategoryIdData);      
    }
  }




  getLocationData() {
    let localLocData = localStorage.getItem('LOC_DATA');
    if(localLocData) {
      return this.decryptData(localLocData);      
    }else{
      return false;
    }
  }




  getLocationDataWithPromise() {
    return new Promise((resolve, reject) => {
      let localLocData = localStorage.getItem('LOC_DATA');
      if(localLocData) {
        let data = this.decryptData(localLocData)
        resolve(data);      
      }else{
        reject(false);
      }
    })    
  }





  getFormData() {
    let localLocData = localStorage.getItem('FORM_DATA');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else {
      return {
        data: null,
        status: false
      }
    }
  }





  getImageData() {
    let localLocData = localStorage.getItem('image_data');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else{
      return {
        data: null,
        status: false
      }
    }
  }





  getSortedVendorList() {
    let localLocData = localStorage.getItem('vendor_list_data');
    if(localLocData) {
      return this.decryptData(localLocData);      
    }
  }





  deleteFirstVendorFromTheListAndSave(arr: Array<any>) {
    arr.shift();
    let encryptedData = this.encryptData(arr);          
    localStorage.setItem('vendor_list_data', encryptedData);
  }





  getCustomerAddress() {
    let localLocData = localStorage.getItem('cus_address');
    if(localLocData) {
      return this.decryptData(localLocData);      
    }
  }





  getJobData() {
    let localLocData = localStorage.getItem('job_data');
    if(localLocData) {
      return this.decryptData(localLocData);      
    }else{
      return null;
    }
  }





  getAcceptVendorData(){    
    let localLocData = localStorage.getItem('accept_vendor_data');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else{
      return {
        data: null,
        status: false
      }
    }
  }





  getVendorArrivedData(){    
    let localLocData = localStorage.getItem('vendor_arrived_data');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else{
      return {
        data: null,
        status: false
      }
    }
  }






  getScheduledData(){    
    let localLocData = localStorage.getItem('schedule_data');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else{
      return {
        data: null,
        status: false
      }
    }
  }





  jobCartData(){    
    let localLocData = localStorage.getItem('job_cart_data');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else{
      return {
        data: null,
        status: false
      }
    }
  }





  jobNoteData(){    
    let localLocData = localStorage.getItem('note_for_professional');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else{
      return {
        data: null,
        status: false
      }
    }
  }





  chargeIdData(){    
    let localLocData = localStorage.getItem('charge_id');
    if(localLocData) {
      return {
        data: this.decryptData(localLocData),
        status: true
      }      
    }else{
      return {
        data: null,
        status: false
      }
    }
  }





  getMonth() {
    var today = new Date();
    let month = today.getMonth()+1;
    if(month.toString().length == 1){
      return `0${month}`;
    }else{
      return month;
    }
  }





  getDate() {
    var today = new Date();
    let date = today.getDate();
    if(date.toString().length == 1){
      return `0${date}`;
    }else{
      return date;
    }
  }





  getCurrentDate() {
    var today = new Date();
    return today.getFullYear()+'-'+this.getMonth()+'-'+this.getDate();
  }





  getCurrentTime() {
    var today = new Date();
    return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  }





  removeJobRelatedLocalData() {
    localStorage.removeItem('FORM_DATA');
    localStorage.removeItem('sub_category_id');
    localStorage.removeItem('category_id');
    localStorage.removeItem('service');
    localStorage.removeItem('job_data');
    localStorage.removeItem('schedule_data');
    localStorage.removeItem('job_cart_data');
    localStorage.removeItem('note_for_professional');
    localStorage.removeItem('charge_id');
    localStorage.removeItem('image_data');
    localStorage.removeItem('vendor_arrived_data');
    localStorage.removeItem('accept_vendor_data');
    localStorage.removeItem('cus_address');
    localStorage.removeItem('vendor_push_data');
    localStorage.removeItem('approve_job_data');
  }





  getScheduleTime() {
    return [
      {id: 8, time : '08:00', active: true},
      {id: 9, time : '09:00', active: false},
      {id: 10, time : '10:00', active: false},
      {id: 11, time : '11:00', active: false},
      {id: 12, time : '12:00', active: false},
      {id: 13, time : '13:00', active: false},
      {id: 14, time : '14:00', active: false},
      {id: 15, time : '15:00', active: false},
      {id: 16, time : '16:00', active: false},
      {id: 17, time : '17:00', active: false},
      {id: 18, time : '18:00', active: false},
      {id: 19, time : '19:00', active: false},
      {id: 20, time : '20:00', active: false}
    ]
  }





  getErrorText() {
    return {
      required: 'is required',
      minlength: `Minimum character required`,
      maxlength: `Maximum character allowed`,
      pattern: 'Invalid entry on',
      email: 'Please enter a valid'
    }
  }











  


}
