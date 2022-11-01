import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { NavController, Platform } from '@ionic/angular';
import { ToasterService } from 'src/app/service/toaster.service';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {

  searchlist: boolean = false;
  searchclose: boolean = false;
  searchbtn: boolean = true;
  categoryList: any;
  baseImageUrl: string = environment.baseImageUrl;
  defaultImage: string = '../../../assets/images/fixing.jpg';
  searchResultList: Array<Object> = [];
  searchTerm: string = '';
  serviceList: Array<Object> = [];
  showLoader: boolean = false;

  tabActiveStatus: Array<any> = ['true', 'false', 'false','false'];

  constructor(
    private apiService: ApiService, 
    private route: Router, 
    private helper: HelpermethodsService, 
    private navCtrl: NavController,
    private toast: ToasterService,
    private platform: Platform,
  ) { }



  ngOnInit() {
    // this.getCategoryList();
    this.getServiceList();

    let encryptedData = this.helper.encryptData(this.tabActiveStatus);
    localStorage.setItem('active_status', encryptedData);

    this.helper.removeJobRelatedLocalData();
  }



  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on CategoryComponent.');
    this.getCategoryList();
    this.helper.removeJobRelatedLocalData();
    // this.disableBackBtn();
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


  onClickCategory(id, name, event) {
    // console.log('category id :..............', id);
    event.stopPropagation();

    let data = {
      category_id: id,
      name,
    };

    let encryptedData = this.helper.encryptData(data);
    localStorage.setItem('category_id', encryptedData);
    this.showLoader = true;
    this.route.navigate([`sub-category`]);
  }



  goBack(){
    this.navCtrl.pop();
  }




  onTypeSearchTerm(e) {

    console.log('search input value : ...............', e.target.value); 
    if(!e.target.value.trim() || e.target.value.trim() == '' || e.target.value == '') {
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
        // console.log('decrypted data :..............................', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0) {
            this.searchlist = true;
            this.searchResultList = decrypted.data;
            // console.log('api responce search result :...........', this.searchResultList);
          }else {
            this.searchlist = false;
            this.searchResultList = [];
            let toast = await this.toast.presentToast('Warning!', decrypted.msg, "warning", 2000); 
            toast.present();
          }
        }else {
          this.searchlist = false;
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
    this.showLoader = true;
    this.route.navigate([`searchresult`]);
  }




  getServiceList() {
    this.showLoader = true;
    this.apiService.getServiceList().subscribe((data: any) => { 
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        console.log('decrypted data :..............................', decrypted);

        if(decrypted.status) {
          if(decrypted.data !== null && decrypted.data.length > 0){
            this.serviceList = decrypted.data;
            console.log('api responce service list :...........', this.serviceList);
          }else{
            this.serviceList = [];
          }
          this.showLoader = false;
        }else {
          this.showLoader = false;
        }
      }     
    });
  }





  onClickServiceSearchResult(serviceData) {
    console.log('service data :...............', serviceData);
    
    let payload = {
      service_id: serviceData.id,
      name: serviceData.name,
      image: serviceData.service_icon,
      price: serviceData.price,
      price_2: serviceData.price_2,
      price_3: serviceData.price_3
    };

    let data = {
      sub_category_id: serviceData.sub_category.id,
      name: serviceData.sub_category.name
    };

    let cat_details = {
      category_id: serviceData.category_name.id, 
      name: serviceData.category_name.name
    };

    let encryptedData1 = this.helper.encryptData(data);
    let encryptedData2 = this.helper.encryptData(cat_details);
    localStorage.setItem('sub_category_id', encryptedData1);
    localStorage.setItem('category_id', encryptedData2);
    let encryptedData = this.helper.encryptData(payload);
    localStorage.setItem('service', encryptedData);

    let routeName = serviceData.sub_category.name.replace(/ /g, "-");
    console.log('route name :...............', routeName);
    routeName = `register/${routeName}`;
    this.route.navigate([routeName]);
  }





  disableBackBtn() {
    // this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('hello');
        }, false);
      });
      // this.statusBar.styleDefault();
    // });
  }




  




}
