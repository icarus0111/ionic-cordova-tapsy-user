import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { ToasterService } from 'src/app/service/toaster.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {

  star: Array<any> = []

  starBlank: string = '../../../assets/images/star-empty.svg';
  starFill: string = '../../../assets/images/star-full.svg';
  starValue: any = 1;
  review: any = '';
  showLoader: boolean = false;
  id: any;

  constructor(
    private apiService: ApiService,
    private helper: HelpermethodsService,
    private toast: ToasterService,
    private route: Router,
    ) { }

  ngOnInit() {
    this.generateStarArray(5);
    this.checkForSharedData();
  }




  checkForSharedData() {
    this.helper.currentMessage.subscribe(async (data: any) => {
      if(data) {
        let sharedData = JSON.parse(data);  
        if(sharedData && sharedData.isComeFromScheduledJob && sharedData.jobId) {
          this.id = sharedData.jobId;
          this.helper.changeMessage('');
        }
      }
    });
  }




  generateStarArray(numofstar){
    for (let index = 0; index < numofstar; index++) {
      this.star.push({
        image: this.starBlank,
        value: index+1,
      })      
    }

    // console.log('star array', this.star); 
    
    this.onClickStar(5);
  }




  onClickStar(value) {
    this.starValue = value;

    this.star.forEach(item => {
      if(item.value <= value){
        item.image = this.starFill;
      }else{
        item.image = this.starBlank;
      }
    });

  }




  onSubmitReview() {
    this.showLoader = true;
    let jobData: any = this.helper.getJobData();
    let jobID = null;

    if(this.id){
      jobID = this.id;
      this.jobUpdateWithReviewStatus(this.id);
    }else{
      jobID = jobData.id;
    }

    if(this.review.trim() == ''){
      this.review = '';
    }

    let payload = {
      job_id: jobID,
      value: this.starValue,
      review: this.review
    }

    this.apiService.createReview(payload).subscribe(async(data)=>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        if(decrypted.status) {
          this.helper.removeJobRelatedLocalData();
          let toast = await this.toast.presentToast('Success!', decrypted.msg, "success", 5000); 
          toast.present();
          this.showLoader = false;
          this.route.navigate([`category`]);
        }else{
          this.showLoader = false;
          let toast = await this.toast.presentToast('Error!', decrypted.msg, "danger", 5000); 
          toast.present();
        }
      }
    },async(error)=>{
      this.showLoader = false;
      let toast = await this.toast.presentToast('Warning!', 'Something wrong. Try again.', "danger", 5000); 
      toast.present();
    });
  }





  jobUpdateWithReviewStatus(id) {

    this.showLoader = true;
    // let jobData = this.helper.getJobData();

    let jobUpdatePayload = {
      id: id,
      updateData: {
        is_reviewed_scheduled_job: 1
      }
    }
  

    this.apiService.updateJobs(jobUpdatePayload).subscribe(async (data) => {
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        // console.log('decrypt data :............', decrypted); 
        if(decrypted.status){
          this.showLoader = false;
        }else{
          this.showLoader = false;
        }
      }
    },async (error) => {
      this.showLoader = false;
    });

  }



}
