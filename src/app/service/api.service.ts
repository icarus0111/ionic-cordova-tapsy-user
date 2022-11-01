import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import {User} from "../model/user.model";
import {Observable} from "rxjs/index";
import {ApiResponse} from "../model/api.response";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  login(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/users/login`, payload);
  }

  register(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/users/register`, payload);
  }

  loginWithEmail(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/users/loginWithEmail`, payload);
  }

  verifyMobile(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/users/verifymobile`, payload);
  }

  getCategoryList() : Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.baseUrl}/category/list`);
  }

  getSubCategoryByCategoryId(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/subcategory/getSubCategoryByCategoryId`, payload);
  }

  getServiceBySubCategoryId(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/service/getServiceBySubCategoryId`, payload);
  }

  searchForservice(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/service/searchForservice`, payload);
  }

  getServiceList() : Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.baseUrl}/service/list`);
  }

  getDistance(source, destination) : Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${source}&destinations=place_id:${destination}&key=AIzaSyAvi8izJBiY5SXocu2gM-UH0cVr6LDpGks`);
  }

  addToken(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/connection/update`, payload);
  }

  sendPushNotification(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/users/sendNotification`, payload);
  }

  searchForNearByVendors(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/vendor/searchForNearByVendors`, payload);
  }

  getCarBrand() : Observable<any> {
    // return this.http.get<any>(`https://www.remotesandkeys.com.au/api/get_brand`);
    return this.http.get<any>(`${environment.baseUrl}/brand/allList`);
  }

  getCarModels(payload) : Observable<any> {
    // return this.http.post<any>(`https://www.remotesandkeys.com.au/api/get_model`, payload);
    return this.http.post<any>(`${environment.baseUrl}/model/getmodelbybrandid`, payload);
  }

  getCarYears(payload) : Observable<any> {
    // return this.http.post<any>(`https://www.remotesandkeys.com.au/api/get_year`, payload);
    return this.http.post<any>(`${environment.baseUrl}/model/getmodelbymodelname`, payload);
  }

  createJobs(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/jobs/create`, payload);
  }

  updateJobs(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/jobs/update`, payload);
  }

  getVendorById(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/vendor/getVendorById`, payload);
  }

  getServerDateTime() : Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/service/getServerDate&Time`);
  }

  createCharge(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/pay/createCharge`, payload);
  }

  updatePaymentDetails(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/payment-details/update`, payload);
  }

  getPayment(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/pay/getPayment`, payload);
  }


  getRefund(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/pay/getRefund`, payload);
  }


  createReview(payload) : Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/review/create`, payload);
  }

  getPlaceInfoFromCoords(lat, long) : Observable<any> {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyAvi8izJBiY5SXocu2gM-UH0cVr6LDpGks`);
  }
  

  //-------------------------------------------------------------
  // get all jobs list data for customer 
  //-------------------------------------------------------------
  getAllJobsListByUser(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/jobs/getjobsbyuser`, payload);
  }

  getMyAccountDetail(payload) : Observable<ApiResponse> {
    //console.log(`${environment.baseUrl}/user/get-details`);
    return this.http.post<ApiResponse>(`${environment.baseUrl}/user/get-details`, payload);
  }

  getStateList() : Observable<ApiResponse> {
    //console.log(`${environment.baseUrl}/user/get-details`);
    return this.http.get<ApiResponse>(`${environment.baseUrl}/state/list`);
  }

  account_upadate(payload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.baseUrl}/users/update`, payload);
  }

  getBookingDetails(payload) : Observable<ApiResponse> {
    //console.log(`${environment.baseUrl}/user/get-details`);
    return this.http.post<ApiResponse>(`${environment.baseUrl}/jobs/getjobbyid`, payload);
  }

  getLimitJobsListByUser(payload) : Observable<ApiResponse> {
    //console.log(`${environment.baseUrl}/user/get-details`);
    return this.http.post<ApiResponse>(`${environment.baseUrl}/jobs/getjobsbyuserwithoffsetlimit`, payload);
  }

  // https://www.remotesandkeys.com.au/api/get_brand
  // https://www.remotesandkeys.com.au/api/get_model ['brand']
  // https://www.remotesandkeys.com.au/api/get_year ['model']




}
