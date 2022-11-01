import { Component, OnInit } from '@angular/core';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';
import { ToasterService } from 'src/app/service/toaster.service';

@Component({
  selector: 'app-searchresult',
  templateUrl: './searchresult.component.html',
  styleUrls: ['./searchresult.component.scss'],
})
export class SearchresultComponent implements OnInit {

  searchlist: boolean = false;
  searchclose: boolean = false;
  searchbtn: boolean = true;
  searchData: any;
  showIcon: any;
  defaultImage: string = '../../../assets/images/fixing.jpg';
  baseImageUrl: string = environment.baseImageUrl;
  isCategoryOrSubCategory: boolean;
  searchResultList: Array<Object> = [];
  searchTerm: string = '';
  showLoader: boolean = false;
  subCategoryIdData: any;
  
  
  constructor(private navCtrl: NavController, private helper: HelpermethodsService, private router: Router, private apiService: ApiService, private toast: ToasterService) { }

  ngOnInit() {
    console.log('search result page.');    
  }



  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on CategoryComponent.');
    this.getLocalSearchValue();
  }



  searchresult() {
    this.searchlist = true;
    this.searchclose = true;
    this.searchbtn = false;
  }

  closebtn(){
    this.searchlist = false;
    this.searchbtn = true;
  }

  searchopen(){
    this.searchclose = false;
  }


  getLocalSearchValue() {
    let localSearchData = localStorage.getItem('search_data');
    if(localSearchData){
      this.searchData = this.helper.decryptData(localSearchData);
      console.log('local data on search page :....................', this.searchData);
      this.getIcon(this.searchData);      
      return this.searchData;
    }
  }



  
  getIcon(data) {

    if(data.parent_id > 0){
      this.isCategoryOrSubCategory = true;
      this.showIcon = data.sub_category_icon; 
    }else if(data.parent_id == 0){
      this.isCategoryOrSubCategory = true;
      this.showIcon = data.category_icon;
    }else if(!data.parent_id){
      this.isCategoryOrSubCategory = false;
      this.showIcon = data.service_icon;
    }else{
      this.showIcon = null;
    }  
    
    console.log('isCategoryOrSubCategory : ............', this.isCategoryOrSubCategory, this.showIcon);    
  }





  async onClickServiceSearchResult() {
    let payload = {
      service_id: this.searchData.id,
      name: this.searchData.name,
      image: this.searchData.service_icon,
      price: this.searchData.price,
      price_2: this.searchData.price_2,
      price_3: this.searchData.price_3
    };
    let data = {
      sub_category_id: this.searchData.sub_category.id,
      name: this.searchData.sub_category.name
    };
    let parent_details = {
      category_id: this.searchData.category_name.id, 
      name: this.searchData.category_name.name
    };

    let encryptedData1 = this.helper.encryptData(data);
    let encryptedData2 = this.helper.encryptData(parent_details);
    localStorage.setItem('sub_category_id', encryptedData1);
    localStorage.setItem('category_id', encryptedData2);
    let encryptedData = this.helper.encryptData(payload);
    localStorage.setItem('service', encryptedData);

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




  async getSubCategoryIdFromLocal() {
    let localSubCategoryIdData = localStorage.getItem('sub_category_id');
    if(localSubCategoryIdData){
      this.subCategoryIdData = this.helper.decryptData(localSubCategoryIdData);
      return this.subCategoryIdData;
    }
  }





  onClickCategoryOrService() {
    if(this.searchData.parent_id > 0){

      let data = {
        sub_category_id: this.searchData.id,
        name: this.searchData.name
      };

      let parent_details = {
        category_id: this.searchData.parent_category.id, 
        name: this.searchData.parent_category.name
      };
  
      let encryptedData = this.helper.encryptData(data);
      let encryptedData2 = this.helper.encryptData(parent_details);
      localStorage.setItem('sub_category_id', encryptedData);
      localStorage.setItem('category_id', encryptedData2);
      this.router.navigate([`category-details`]);

    }else if(this.searchData.parent_id == 0){

      let data = {
      category_id: this.searchData.id,
      name: this.searchData.name
    };

    let encryptedData = this.helper.encryptData(data);
    localStorage.setItem('category_id', encryptedData);
    this.router.navigate([`sub-category`]);

    }
  }





  goBack(){
    this.navCtrl.pop();
  }





  onTypeSearchTerm(e) {

    // console.log('search input value : ...............', e.target.value); 
    if(!e.target.value.trim() || e.target.value.trim() == '') {
      this.searchResultList = [];
      this.searchlist = false;
      return;
    }

    let query = {
      query: `${e.target.value.trim()}` 
    }

    this.apiService.searchForservice(query).subscribe(async (data: any) => {   
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            this.searchResultList = decrypted.data;
            console.log('api responce search result :...........', this.searchResultList);
          }else {
            this.searchResultList = [];
            let toast = await this.toast.presentToast('Warning!', decrypted.msg, "warning", 2000); 
            toast.present();
          }
        }else {
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 4000); 
          toast.present();
        }
      }     
    }); 

  }





  onClickSearchResult(data) {
    // console.log('on click search result :..................', data); 
    this.searchResultList = [];
    this.searchTerm = '';
    let encryptedData = this.helper.encryptData(data);
    localStorage.setItem('search_data', encryptedData); 
    // this.router.navigate([`searchresult`]);
    this.getLocalSearchValue();
  }





}
