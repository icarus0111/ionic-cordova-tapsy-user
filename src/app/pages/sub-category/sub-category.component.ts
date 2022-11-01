import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/service/alert.service';
import { ApiService } from 'src/app/service/api.service';
import { Router } from '@angular/router';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.scss'],
})
export class SubCategoryComponent implements OnInit {

  subCategoryList: Array<object>;
  categoryList: Array<object>;
  defaultImage: string = '../../../assets/images/fixing.jpg';
  baseImageUrl: string = environment.baseImageUrl;
  categoryIdData: any;
  title: any;
  showLoader: boolean = false;

  segmentButtonClicked(ev: any) {
    // console.log('Segment button clicked', ev);
  }
  constructor(private alert: AlertService, private apiService: ApiService, private route:Router, private helper: HelpermethodsService, private navCtrl: NavController) { }

  ngOnInit() {}


  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on SubCategoryComponent.');
    this.getCategoryList();
    this.getDefaultSubCategoryList();    
  }



  getCategoryList() {
    this.showLoader = true;
    this.apiService.getCategoryList().subscribe((data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0){
            this.categoryList = decrypted.data;
            // console.log('api responce category list :...........', this.categoryList);
          }else{
            this.categoryList = [];
          }
          this.showLoader = false;
        }else {
          this.showLoader = false;
        }
      }     
    });
  }



  async getCategoryIdFromLocal() {
    let localCategoryIdData = localStorage.getItem('category_id');
    if(localCategoryIdData){
      this.categoryIdData = this.helper.decryptData(localCategoryIdData);
      return this.categoryIdData;
    }
  }




  async getSubCategoryList(payload) {
    this.showLoader = true;
    this.apiService.getSubCategoryByCategoryId(payload).subscribe(async (data: any) => { 
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0){
            this.subCategoryList = decrypted.data;
            // console.log('api responce sub-category list :...........', this.subCategoryList);
          }else{
            this.subCategoryList = [];
            const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No sub-category found. Try refresh.');
            alert.present();
          }
          this.showLoader = false;
        }else {
          this.showLoader = false;
          const alert = await this.alert.presentAlertConfirm('Alert!', 'Sorry, No sub-category found. Try refresh.');
          alert.present();
        }
      }           
      
    });
  }




  async getDefaultSubCategoryList() {
    let cat = await this.getCategoryIdFromLocal();
    // console.log('local cat data :');    
    if(cat){
      this.title = cat.name;
      await this.getSubCategoryList(cat);
    }
  }




  getSubCategory(id, name) {

    this.title = name;

    let payload = {
      category_id: id,
      name
    };

    let encryptedData = this.helper.encryptData(payload);
    localStorage.setItem('category_id', encryptedData);
    
    this.getSubCategoryList(payload);
    this.getCategoryIdFromLocal();
  }




  gotoServiceListPage(id, name) {
    let data = {
      sub_category_id: id,
      name,
    };

    let encryptedData = this.helper.encryptData(data);
    localStorage.setItem('sub_category_id', encryptedData);
    this.showLoader = true;
    this.route.navigate([`category-details`]);
  }




  goBack(){
    this.navCtrl.pop();
  }

}
