import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
// import { Observable } from 'rxjs';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';

@Injectable({
  providedIn: 'root'
})
export class RouteGuard implements CanActivate {

  constructor(private helper: HelpermethodsService, private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if(this.checkForUserData()) {
      return true;
    } else {
      this.router.navigate(['home']);
      return false;
    }    
  }



  checkForUserData() {
    let localUserData = localStorage.getItem('user_data');
    let localTokenData = localStorage.getItem('token');
    if(localUserData && localTokenData) {
      let userData = this.helper.decryptData(localUserData);
      if(userData.phone && userData.role_id && userData.id){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    } 
  }


  
}
