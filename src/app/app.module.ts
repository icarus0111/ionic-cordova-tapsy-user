import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { OtpComponent } from 'src/app/pages/otp/otp.component';
import { CategoryComponent } from 'src/app/pages/category/category.component';
import { SearchresultComponent } from 'src/app/pages/searchresult/searchresult.component';
import { SubCategoryComponent } from 'src/app/pages/sub-category/sub-category.component';
import { CategoryDetailsComponent } from 'src/app/pages/category-details/category-details.component';
import { RegisterComponent } from 'src/app/pages/register/register.component';
import { BottomTabComponent } from 'src/app/pages/bottom-tab/bottom-tab.component';
import { LocationComponent } from 'src/app/pages/location/location.component';
import { NotFound404Component } from './pages/others/not-found404/not-found404.component';

import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {ApiService} from "./service/api.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {TokenInterceptor} from "./interceptors/interceptor";
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoaderComponent } from './pages/others/loader/loader.component';
import { SearchVendorLocationComponent } from './pages/search-vendor-location/search-vendor-location.component';
import { TrackingVendorComponent } from './pages/tracking-vendor/tracking-vendor.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { FCM } from '@ionic-native/fcm/ngx';
import { RegisterResidentialLocksmithComponent } from './pages/register-residential-locksmith/register-residential-locksmith.component';
import { RegisterCommercialLocksmithComponent } from './pages/register-commercial-locksmith/register-commercial-locksmith.component';
import { Camera } from '@ionic-native/camera/ngx';
import { JobAcceptedComponent } from './pages/job-accepted/job-accepted.component';
import { BookingTimingComponent } from './pages/booking-timing/booking-timing.component';
import { CardPaymentComponent } from './pages/card-payment/card-payment.component';
import { CartComponent } from './pages/cart/cart.component';
import { MyBookingComponent } from './pages/my-booking/my-booking.component';
import { SuccessComponent } from './pages/success/success.component';
import { ScheduleDateComponent } from './pages/schedule-date/schedule-date.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { NgCalendarModule  } from 'ionic2-calendar';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { StripeService } from './service/stripe.service';
import { Stripe } from '@ionic-native/stripe/ngx';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { HelpCenterComponent } from './pages/help-center/help-center.component';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { BookingDetailsComponent } from './pages/booking-details/booking-details.component';
import { StartedJobComponent } from './pages/started-job/started-job.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
// import { Push } from '@ionic-native/push/ngx';
// import { ImagePicker } from '@ionic-native/image-picker/ngx';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    UserRegistrationComponent,
    OtpComponent,
    CategoryComponent,
    SearchresultComponent,
    SubCategoryComponent,
    CategoryDetailsComponent,
    RegisterComponent,
    BottomTabComponent,
    LocationComponent,
    NotFound404Component, 
    LoaderComponent, 
    SearchVendorLocationComponent, 
    TrackingVendorComponent, 
    PaymentComponent, 
    RegisterResidentialLocksmithComponent, 
    RegisterCommercialLocksmithComponent, 
    JobAcceptedComponent,
    BookingTimingComponent,
    CardPaymentComponent,
    CartComponent,
    SuccessComponent,
    ScheduleDateComponent,
    MyBookingComponent,
    MyAccountComponent,
    HelpCenterComponent,
    BookingDetailsComponent,
    StartedJobComponent
  ],

  entryComponents: [],
  imports: [
    BrowserModule, 
    HttpClientModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    NgCalendarModule,
    NgbModule,
    // Diagnostic
  ],
  providers: [
    ApiService,
    StripeService,
    StatusBar,
    SplashScreen,
    Geolocation,
    FCM,
    Camera,
    Stripe,
    CallNumber,
    Diagnostic,
    // Push,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi : true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

//change the basehref

// pod init

// # add the Firebase pod for Google Analytics
// pod 'Firebase/Analytics'
// # add pods for any other desired Firebase products
// # https://firebase.google.com/docs/ios/setup#available-pods

// pod install
// (631) 479-2191
// +16314792191
