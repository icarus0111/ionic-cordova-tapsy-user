import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs/internal/Observable";
import {Injectable} from "@angular/core";
import { HelpermethodsService } from '../service/helpermethods.service';
// import { HelpermethodsService } from 'src/app/service/helpermethods.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private helper: HelpermethodsService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = localStorage.getItem('token');
    // console.log('token from local : .........', token);
    if (token) {
      token = this.helper.decryptData(token);       
    }else {
      token = null;
    }

    // console.log('url :....', request.url.substring(8, 27));    

    if (request.method.toLowerCase() === 'post' && request.url !== 'https://www.remotesandkeys.com.au/api/get_model' && request.url !== 'https://www.remotesandkeys.com.au/api/get_year') {
      // console.log('request data :.................', request);      
        request =  request.clone({
          body: {
              TAP_REQ: this.helper.encryptDataFromRequest(request.body)
          },
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'authorization': `Bearer ${token}`
          })
        })         
    }else if(request.method.toLowerCase() === 'get' && request.url.substring(8, 27) !== 'maps.googleapis.com'){
      request =  request.clone({
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'authorization': `Bearer ${token}`
        })
      }) 
    }
    return next.handle(request);
  }
}