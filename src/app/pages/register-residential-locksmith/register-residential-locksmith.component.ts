import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';
import { AlertService } from 'src/app/service/alert.service';
import { environment } from 'src/environments/environment';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

@Component({
  selector: 'app-register-residential-locksmith',
  templateUrl: './register-residential-locksmith.component.html',
  styleUrls: ['./register-residential-locksmith.component.scss'],
})
export class RegisterResidentialLocksmithComponent implements OnInit {

  [x: string]: any;
  registerForm: FormGroup;
  showLoader: boolean = false;
  imageURI: any = '';
  title: string;
  imageFileName: string;
  serviceImage: any;
  baseImageUrl: string = environment.baseImageUrl;
  previousformdata: any;

  constructor(
    private route: Router,
    private camera: Camera,
    private helper: HelpermethodsService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private apiService: ApiService,
    private alert: AlertService, 
  ) { }

  ngOnInit() {
    this.initializeForm();
    // getServiceDetailsFromLocal();
  }



  ionViewWillEnter(){
    console.log('ionViewWillEnter() called on SubCategoryComponent.');
    this.initializeForm();
    this.getServiceDetailsFromLocal();   
    this.setFormData(); 
  }





  initializeForm() {
    // window.localStorage.removeItem('token');
    this.registerForm = this.formBuilder.group({
      house_type: [null, Validators.compose([Validators.required])],
      number_of_lock: [1, Validators.compose([Validators.required, Validators.pattern(/^[0-9]*$/)])]
    });
  }




  getFormValue() {
    console.log(this.registerForm.value);    
    return this.registerForm.value;
  }




  getServiceDetailsFromLocal() {
    this.helper.getServiceDetailsFromLocal().then((data: any) => {
      console.log('service details :........................', data); 
      this.title = data.name; 
      this.serviceImage = data.image;
      this.showLoader = false;   
    }).catch(err => {
      console.log('service details error:........................', err);
      this.showLoader = false;
    })
  }





  goBack(){
    this.navCtrl.pop();
  }




  // onSubmitRegisterForm(){
  //   localStorage.removeItem('FORM_DATA');
  //   console.log('form value :.....................', this.getFormValue()); 
  //   alert('form data : ...........'+ JSON.stringify(this.getFormValue()));   
  //   // this.route.navigate(['/location']);
  //   let encryptedData = this.helper.encryptData(this.getFormValue());
  //   localStorage.setItem('FORM_DATA', encryptedData);
  // }




  async onSubmitRegisterForm() {
    // console.log('submit :............');
    this.showLoader = true;

    if (this.registerForm.invalid) {
      // this.showPhoneNumberError();
      this.getFormErrors().then(async(data: any) => {
        // console.log('errors messages list :............', data); 
        if(data && data.length > 0) {
          const alert = await this.alert.presentAlertConfirm('Alert!', data[0].errorText);
          alert.present();
        }               
      }).catch(err=> {
        // console.log(err);        
      }); 
      
      this.showLoader = false;
      return;
    }

    // console.log('form data : ...........'+ JSON.stringify(this.getFormValue()));  

    let encryptedData = this.helper.encryptData(this.getFormValue());
    localStorage.setItem('FORM_DATA', encryptedData);

    this.route.navigate(['/booking-timing']);
  }



  getImage() {
    
    const options: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(
      
      imageData => {
        // alert('upload image data :...................'+ imageData);        
        this.imageURI = imageData;
        this.imageFileName = imageData;

        // this.registerForm.patchValue({
        //   uploaded_image: imageData
        // })

        let encryptedData = this.helper.encryptData(imageData);
        localStorage.setItem('image_data', encryptedData);

      },
      err => {
        console.log(err);
        // this.presentToast(err);
      }
    );
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
      // return true;
      // console.log('form data :........', formdata.data); 
      // this.getModels(formdata.data.car_brand);
      // this.getCarYears(formdata.data.car_manufacturing_year.sub_category_id); 

      this.registerForm.patchValue({
        house_type: formdata.data.house_type,
        number_of_lock: formdata.data.number_of_lock
      });
    }
  }






}
