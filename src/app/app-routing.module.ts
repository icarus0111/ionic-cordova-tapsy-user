import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { OtpComponent } from 'src/app/pages/otp/otp.component';
import { CategoryComponent } from 'src/app/pages/category/category.component';
import { SearchresultComponent } from 'src/app/pages/searchresult/searchresult.component';
import { SubCategoryComponent } from 'src/app/pages/sub-category/sub-category.component';
import { CategoryDetailsComponent } from 'src/app/pages/category-details/category-details.component';
import { RegisterComponent } from 'src/app/pages/register/register.component';
import { LocationComponent } from 'src/app/pages/location/location.component';
import { NotFound404Component } from './pages/others/not-found404/not-found404.component';
import { RouteGuard } from './guard/route.guard';
import { SearchVendorLocationComponent } from './pages/search-vendor-location/search-vendor-location.component';
import { TrackingVendorComponent } from './pages/tracking-vendor/tracking-vendor.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { RegisterResidentialLocksmithComponent } from './pages/register-residential-locksmith/register-residential-locksmith.component';
import { RegisterCommercialLocksmithComponent } from './pages/register-commercial-locksmith/register-commercial-locksmith.component';
import { JobAcceptedComponent } from './pages/job-accepted/job-accepted.component';
import { BookingTimingComponent } from './pages/booking-timing/booking-timing.component';
import { CardPaymentComponent } from './pages/card-payment/card-payment.component';
import { CartComponent } from './pages/cart/cart.component';
import { SuccessComponent } from './pages/success/success.component';
import { ScheduleDateComponent } from './pages/schedule-date/schedule-date.component';
import { MyBookingComponent } from './pages/my-booking/my-booking.component';
import { HelpCenterComponent } from './pages/help-center/help-center.component';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { BookingDetailsComponent } from './pages/booking-details/booking-details.component';
import { StartedJobComponent } from './pages/started-job/started-job.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';




const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  // },
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'userRegistration', component: UserRegistrationComponent
  },
  {
    path: 'otp', component: OtpComponent
  },
  {
    path: 'category', 
    component: CategoryComponent, 
    canActivate: [RouteGuard]
  },
  {
    path: 'searchresult', 
    component: SearchresultComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'sub-category', component: SubCategoryComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'category-details', component: CategoryDetailsComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'register/automotive-locksmith', component: RegisterComponent,
    // canActivate: [RouteGuard]
  },
  {
    path: 'register/residential-locksmith', component: RegisterResidentialLocksmithComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'register/commercial-locksmith', component: RegisterCommercialLocksmithComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'location', component: LocationComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'search-vendor', component: SearchVendorLocationComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'job-accepted', component: JobAcceptedComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'track-vendor', component: TrackingVendorComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'payment', component: PaymentComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'booking-timing', component:BookingTimingComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'card-payment', component:CardPaymentComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'cart', component:CartComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'success', component:SuccessComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'schedule-date', component:ScheduleDateComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'my-booking', component: MyBookingComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'help-center', component: HelpCenterComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'my-account', component: MyAccountComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'booking-details', component: BookingDetailsComponent,
    canActivate: [RouteGuard]
  },
  {
    path: 'started-job', component: StartedJobComponent,
    canActivate: [RouteGuard]
  },
  {
    path: '**', component: NotFound404Component
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})


export class AppRoutingModule {}
