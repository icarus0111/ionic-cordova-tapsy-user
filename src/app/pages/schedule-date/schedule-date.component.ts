import { Component, ViewChild, OnInit, Inject, LOCALE_ID } from '@angular/core';
import {NgbDateStruct, NgbCalendar, NgbDatepickerConfig} from '@ng-bootstrap/ng-bootstrap';
import { HelpermethodsService } from 'src/app/service/helpermethods.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-schedule-date',
  templateUrl: './schedule-date.component.html',
  styleUrls: ['./schedule-date.component.scss'],
})
export class ScheduleDateComponent implements OnInit {

  model: NgbDateStruct;
  date: {year: number, month: number};
  selectedDate: string;
  scheduleTime: Array<any>;
  selectedTime: string;
  showLoader: boolean = false;
  dateTime: any;
  time: string;
  displayMonths: any;
  arrows: any;

  constructor(
    private calendar: NgbCalendar,
    private helper: HelpermethodsService,
    private router: Router,
    private navCtrl: NavController,
    private config: NgbDatepickerConfig,
    private apiService: ApiService,
  ) { 
    const current = new Date();
    this.config.minDate = { year: current.getFullYear(), month: 
    current.getMonth() + 1, day: current.getDate() };
    var maxMonth = current.getMonth() + 3;
    var maxYear = current.getFullYear();
    var maxDay = current.getDate();

    if(current.getMonth() == 10){
      maxYear = current.getFullYear() + 1;
      maxMonth = 1;
    }else if(current.getMonth() == 11){
      maxYear = current.getFullYear() + 1;
      maxMonth = 2;
    }

    if(current.getDate() == 31){
      maxDay = 30;
    }

    if(current.getMonth() == 11 && current.getDate() > 28){
      maxDay = 28;
    }

    this.config.maxDate = { year: maxYear, month: maxMonth, day: maxDay };
    this.config.outsideDays = 'hidden';

    
  }


  ngOnInit() {
    this.getTime();    
  }



  selectToday(time) {
    this.getScheduleTime();
    this.model = this.calendar.getToday();
    console.log('today date :............', this.model);
    this.selectedDate = this.createDateFromDateObject(this.calendar.getToday());
    console.log('selected date :............', this.selectedDate);  
    
    if(this.selectedDate == this.createDateFromDateObject(this.calendar.getToday())){
      console.log('same date...');  
      console.log('time info ...', time);  
      let filterTime = this.scheduleTime.filter(item =>{
        if(item.id > time.hour){
          console.log(item);
          return item;
        }
      });  
      
      this.scheduleTime = filterTime;
      console.log('schedule data, after filter :...........', this.scheduleTime);
      if(this.scheduleTime && this.scheduleTime.length > 0){
        this.selectedTime = this.scheduleTime[0].time;
        this.scheduleTime[0].active = true;
      }
      
    }
  }





  selectDate(model) {
    // console.log('model name :...............', model);
    this.getScheduleTime();
    this.selectedDate = this.createDateFromDateObject(model);  
    console.log('selected date :................', this.selectedDate); 
    if(this.selectedDate == this.createDateFromDateObject(this.calendar.getToday())){
      console.log('same date...');  
      let filterTime = this.scheduleTime.filter(item =>{
        if(item.id > this.dateTime.hour){
          console.log(item);
          return item;
        }
      });  
      
      this.scheduleTime = filterTime;
      // console.log('schedule data, after filter :...........', this.scheduleTime); 
      if(this.scheduleTime && this.scheduleTime.length > 0) {     
        this.selectedTime = this.scheduleTime[0].time;
        this.scheduleTime[0].active = true;
      }
    }     
  }



  createDateFromDateObject(obj) {
    let date = '';
    let month = '';

    if(obj.day.toString().length == 1){
      date = `0${obj.day}`;
    }else{
      date = `${obj.day}`;
    }

    if(obj.month.toString().length == 1){
      month = `0${obj.month}`;
    }else{
      month = `${obj.month}`;
    }

    return `${obj.year}-${month}-${date}`;
  }



  getScheduleTime(){
    this.scheduleTime = this.helper.getScheduleTime();
    this.selectedTime = this.scheduleTime[0].time;
  }



  onClickScheduleTime(st){
    this.selectedTime = st.time;
    console.log('selected time :...........', this.selectedTime); 

    this.scheduleTime.forEach((data) => {
      if(data.id == st.id){
        data.active = true;
      }else{
        data.active = false;
      }
    })
  }




  onClickConfSchedule(){
    // console.log('schedule data and time :...........', this.selectedDate, this.selectedTime);  
    let scheduleData = {
      date: this.createDateFormat(this.selectedDate),
      time: this.selectedTime,
      date2: this.selectedDate
    } 

    console.log('schedule data and time :...........', scheduleData);
    let encryptedData = this.helper.encryptData(scheduleData);
    localStorage.setItem('schedule_data', encryptedData);

    this.router.navigate(['/cart']);
  }




  createDateFormat(date) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    let splitArr = date.split('-');

    return `${splitArr[2]} ${monthNames[parseInt(splitArr[1])-1]} ${splitArr[0]}`;

  }




  goBack(){
    this.navCtrl.pop();
  }





  getTime(){
    this.showLoader = true;

    this.apiService.getServerDateTime().subscribe((data)=>{
      if(data && data.TAP_RES) {
        let decrypted = this.helper.decryptResponceData(data.TAP_RES);
        if(decrypted.status){
          console.log('server time :.............', decrypted.data); 
          this.dateTime = decrypted.data;
          this.selectToday(this.dateTime); 
          this.showLoader = false;   
        }else{
          this.showLoader = false;
        }        
      }
    }, error=>{
      this.showLoader = false;
    })
  }








}
