import { Component, OnInit } from '@angular/core';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AlertService } from 'src/app/service/alert.service';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss'],
})


export class CategoryDetailsComponent implements OnInit {

  serviceList: Array<object>;
  subCategoryIdData: any = null;
  title: any;
  subCategoryList: Array<object>;
  categoryIdData: any = null;
  defaultImage: string = '../../../assets/images/fixing.jpg';
  baseImageUrl: string = environment.baseImageUrl;
  showLoader: boolean = false;

  constructor(private alert: AlertService, private apiService: ApiService, private route:Router, private helper: HelpermethodsService, private navCtrl: NavController, private router: Router) {
    
  }

  ngOnInit() {
    // this.getDefaultSubCategoryList();
  }



  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on CategoryDetailsComponent.');
    this.getDefaultSubCategoryList();    
  }




  async getCategoryIdFromLocal() {
    let localCategoryIdData = localStorage.getItem('category_id');
    if(localCategoryIdData) {
      this.categoryIdData = this.helper.decryptData(localCategoryIdData);
      return this.categoryIdData;
    }
  }




  async getSubCategoryIdFromLocal() {
    let localSubCategoryIdData = localStorage.getItem('sub_category_id');
    if(localSubCategoryIdData){
      this.subCategoryIdData = this.helper.decryptData(localSubCategoryIdData);
      return this.subCategoryIdData;
    }
  }




  async getSubCategoryList(payload) {
    this.showLoader = true;
    this.apiService.getSubCategoryByCategoryId(payload).subscribe(async (data: any) => {  
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            this.subCategoryList = decrypted.data;
            // console.log('api responce sub-category list :...........', this.subCategoryList);
          }else {
            this.subCategoryList = [];
            const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No sub-category found. Try refresh.');
            alert.present();
          }
          this.showLoader = false;
        }else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();
        }
      }     
    });
  }




  async getServiceList(payload) {
    this.showLoader = true;
    this.apiService.getServiceBySubCategoryId(payload).subscribe(async (data: any) => {   
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0){
            this.serviceList = decrypted.data;
            // console.log('api responce service list :...........', this.serviceList);
          }else{
            this.serviceList = [];
            const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No Service found. Try refresh.');
            alert.present();
          }
          this.showLoader = false;
        }else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', decrypted.msg);
          alert.present();
        }
      }         
      
    });
  }




  async getDefaultSubCategoryList() {
    let serv = await this.getSubCategoryIdFromLocal();
    let cat = await this.getCategoryIdFromLocal();
    if(cat){
      await this.getSubCategoryList(cat);
    }
    if(serv){
      this.title = serv.name;
      await this.getServiceList(serv);
    }
  }




  getServices(id, name) {

    this.title = name;

    let payload = {
      sub_category_id: id
    };

    let encryptedData = this.helper.encryptData(payload);
    localStorage.setItem('sub_category_id', encryptedData);
    this.getServiceList(payload);
    this.getSubCategoryIdFromLocal();
  }




  goBack(){
    this.navCtrl.pop();
  }





  async onClickService(service) {
    // console.log('service details :..............', id,name); 
    
    let payload = {
      service_id: service.id,
      name: service.name,
      image: service.service_icon,
      price: service.price,
      price_2: service.price_2,
      price_3: service.price_3
    };

    let encryptedData = this.helper.encryptData(payload);
    localStorage.setItem('service', encryptedData);
    this.showLoader = true;
    // this.router.navigate(['register']);
    let routeName = await this.navigateToProperRegisterPage();
    routeName = `register/${routeName}`;
    this.router.navigate([routeName]);
  }






  async navigateToProperRegisterPage() {
    let subCatDetails = await this.getSubCategoryIdFromLocal();
    console.log('sub category details :...............', subCatDetails.name);  
    let routeName = subCatDetails.name.replace(/ /g, "-");
    console.log('route name :...............', routeName);
    return routeName;
  }


  



  




}
