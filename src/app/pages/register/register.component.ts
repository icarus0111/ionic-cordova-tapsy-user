import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/service/alert.service';
// import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';

// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  [x: string]: any;
  registerForm: FormGroup;
  carModelList: any = [];
  imageURI: any = null;
  showLoader: boolean = false;
  baseImageUrl: string = environment.baseImageUrl;

  serviceData: any;
  title: any;
  image: any;
  imageFileName: any;
  carYearList: any;
  carBrandList: any;
  previousformdata: any;

  constructor(
    private route:Router,
    private helper: HelpermethodsService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private apiService: ApiService,
    private camera: Camera,
    private alert: AlertService
  ) { }

  ngOnInit() {
    this.initializeForm();
    // this.sendTestPush();
  }



  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on SubCategoryComponent.');
    this.initializeForm();
    this.getServiceDetailsFromLocal(); 
    this.getBrandList();   
  }




  // fileChange(event){
  //   if(event.target.files && event.target.files[0]){
  //     let reader = new FileReader();

  //     reader.onload = (event:any) => {
  //       this.img1 = event.target.result;
  //     }
  //     reader.readAsDataURL(event.target.files[0]);
  //   }
  //     let fileList: FileList = event.target.files;  
  //     let file: File = fileList[0];
  //     console.log(file);
  // }




  location() {
    this.route.navigate(['/location']);
  }




  async getServiceDetailsFromLocal() {
    let localServiceData = localStorage.getItem('service');
    // console.log('local service data :...............', localServiceData);    
    console.log('image link :...............', this.baseImageUrl+this.image);    
    if(localServiceData) {
      this.serviceData = this.helper.decryptData(localServiceData);
      this.title = this.serviceData.name;
      this.image = this.serviceData.image;
      this.showLoader = false;
      return this.serviceData;
    }

    // console.log('image link :...............', this.baseImageUrl+this.image);
  }





  initializeForm(){
    // window.localStorage.removeItem('token');
    this.registerForm = this.formBuilder.group({
      car_brand: [null, Validators.compose([Validators.required])],
      car_model: [null, Validators.compose([Validators.required])],
      car_manufacturing_year: [null, Validators.compose([Validators.required])],
      registration_number: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])]
    });
  }




  getFormValue() {
    return this.registerForm.value;
  }



  getCustomerFormErrors() {
    return this.registerForm.controls;
  }



  disableSubmitBtn() {
    if(this.registerForm.valid){
      return false;
    }else{
      return true;
    }
  }




  getImage() {

    const options: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(
      imageData => {
        // alert('upload image data :...................'+ imageData);        
        this.imageURI = imageData;
        this.imageFileName = imageData;

        let encryptedData = this.helper.encryptData(imageData);
        localStorage.setItem('image_data', encryptedData);

        // this.registerForm.patchValue({
        //   uploaded_image: this.imageURI
        // })

      },
      err => {
        console.log(err);
        // this.presentToast(err);
      });
  }



  // getImage(){
  //   let options:ImagePickerOptions  = {
  //     maximumImagesCount: 1,
  //     outputType: 1
  //   }
  //   this.imagePicker.getPictures(options).then((results) => {
  //     for (var i = 0; i < results.length; i++) {
  //       console.log('Image URI: ' + 'data:image/jpeg;base64,' + results[i]);

  //         // this.imageURI = results[i];
  //         // this.imageFileName = results[i];

  //         // let encryptedData = this.helper.encryptData(results[i]);
  //         // localStorage.setItem('image_data', encryptedData);
  //     }
  //   }, (err) => { });
  // }




  async onSubmitRegisterForm() {
    if (this.registerForm.invalid) {
      this.getFormErrors().then(async(data: any) => {
        console.log('errors messages list ###:............', data); 
        if(data && data.length > 0){
          const alert = await this.alert.presentAlertConfirm('Alert!', data[0].errorText);
          alert.present();
        }               
      }).catch(err=> {
        console.log(err);        
      }); 
      
      this.showLoader = false;
      return;
    }else{
      // console.log('form data : ...........'+ JSON.stringify(this.getFormValue()));     
      let encryptedData = this.helper.encryptData(this.getFormValue());
      localStorage.setItem('FORM_DATA', encryptedData);
      this.route.navigate(['/booking-timing']);
    }    

  }





  goBack(){
    this.navCtrl.pop();
  }





  // sendTestPush() {
  //   // this.showLoader = true;
  //   console.log('calling send push...');  
  //   let payload = {
  //     vendor_id: 49
  //   }  
  //   this.apiService.sendPushNotification(payload).subscribe((data: any) => {    
  //     if(data && data.TAP_RES) {
  //       let decrypted = this.helper.decryptResponceData(data.TAP_RES);
  //       console.log('decrypted data :..............................', decrypted);
  //       if(decrypted.status) {
  //         console.log('send push responce', decrypted);          
  //       }else {
  //         console.log('send push error responce', decrypted);
  //       }
  //     }        
      
  //   });
  // }






  getBrandList() {
    this.showLoader = true;
    this.apiService.getCarBrand().subscribe((data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        if(decrypted.data && decrypted.data.length > 0) {
          this.carBrandList = decrypted.data;

          if(this.setFormData()) {
            console.log('brands :........', this.carBrandList);              
            console.log('data :........', this.previousformdata); 

            this.registerForm.patchValue({
              car_brand: this.previousformdata.car_brand,
            });
            this.getModels(this.previousformdata.car_brand);

          } 
        }else{
          this.carBrandList = [];
        }
      }else{
        this.showLoader = false; 
      }
       
      this.showLoader = false;    
    });
  }





  onChooseBrand(env){
    console.log('choosen brand id :.................', env.target.value); 
    this.carModelList = [];
    this.carYearList = [];

    this.registerForm.patchValue({
      car_model: '',
      car_manufacturing_year: ''
    });

    this.getModels(env.target.value);   
  }




  getModels(brand_id) {
    this.showLoader = true;
    let payload = {
      id: brand_id
    };

    this.apiService.getCarModels(payload).subscribe((data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        if(decrypted.data && decrypted.data.length > 0) {
          this.carModelList = decrypted.data;
          if(this.setFormData()){
            this.registerForm.patchValue({
              car_model: this.previousformdata.car_model,
            });
            this.getCarYears(this.previousformdata.car_model);
          }
          this.showLoader = false;
        }else{
          this.carBrandList = [];
          this.showLoader = false;
        }
      }else{
        this.showLoader = false;
      }       
    }, error => {
      this.showLoader = false;
    });

  }




  onChooseModel(env){
    console.log('choosen brand id :.................', env.target.value); 
    this.carYearList = [];
    this.registerForm.patchValue({
      car_manufacturing_year: ''
    });
    this.getCarYears(env.target.value);   
  }





  getCarYears(sub_category_name) {
    this.showLoader = true;
    
    let payload = {
      name: sub_category_name
    };

    this.apiService.getCarYears(payload).subscribe((data: any) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);

        if(decrypted.data && decrypted.data.length > 0) {
          this.carYearList = decrypted.data;
          console.log('api responce car list :...........', this.carYearList);
          
          if(this.setFormData()){

            this.registerForm.patchValue({
              car_manufacturing_year: this.previousformdata.car_manufacturing_year,
              registration_number: this.previousformdata.registration_number
            });

          }

          this.showLoader = false;
        }else{
          this.carYearList = [];
          this.showLoader = false;
        }
      }else{
        this.showLoader = false;
      }
                
    }, error => {
      this.showLoader = false;
    });

  }




  getFormErrors() {
    // console.log(this.loginForm.controls);
    let allFields = this.registerForm.controls;
    let size = Object.keys(allFields).length;
    var err = {};
    let errorArray = [];

    return new Promise((resolve, reject) => {
      Object.entries(allFields).forEach(
        ([key, value], index) => {
          
          if(value.errors){  
            Object.entries(value.errors).forEach(
              ([k, valu]) => {
                // console.log(key, value);
                err = this.getErrorTexts(k,valu,key);         
                errorArray.push(err);
              }
            );
          }

          if(index+1 == size) {
            resolve(errorArray);
          }
          
        }
      );      
    });    
  }






  getErrorTexts(k,valu,key) {
    let errTexts = this.helper.getErrorText();
    // var err = {};
    if(k == 'minlength' || k == 'maxlength') {
      return {
        fieldName: key,
        errorType: k,
        errorText: `${errTexts[k]} ${valu.requiredLength} on ${key.replace(/_/gi, ' ').toUpperCase()}`
      }                  
    } else if(k == 'required') {
      return {
        fieldName: key,
        errorType: k,
        errorText: `${key.replace(/_/gi, ' ').toUpperCase()} ${errTexts[k]}`
      }
    } else {                  
      return {
        fieldName: key,
        errorType: k,
        errorText: `${errTexts[k]} ${key.toUpperCase()}`
      }
    }
  }






  setFormData() {
    let formdata = this.helper.getFormData();
    if(formdata && formdata.status) {
      this.previousformdata = formdata.data;
      return true;
      // console.log('form data :........', formdata.data); 
      // this.getModels(formdata.data.car_brand);
      // this.getCarYears(formdata.data.car_manufacturing_year.sub_category_id); 

      // this.registerForm.patchValue({
      //   car_brand: formdata.data.car_brand,
      //   car_model: formdata.data.car_manufacturing_year.sub_category_id,
      //   car_manufacturing_year: formdata.data.car_manufacturing_year
      // });
    }
  }




}
