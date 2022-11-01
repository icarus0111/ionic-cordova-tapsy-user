import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { Stripe } from '@ionic-native/stripe/ngx';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private stripe: Stripe) { }


  getStripeSourceToken(data) {
    this.stripe.setPublishableKey(environment.stripe_publishable_key);
  
    let card = {
     number: data.card_number,
     expMonth: data.month,
     expYear: data.year,
     cvc: data.cvv,
     name: data.name,
     currency: 'AUD'
    }

    console.log('card data :............', card);    
    
    return this.stripe.createCardToken(card)
       .then(token => {
         console.log(token.id);
         return token.id;
        })
       .catch(error => 
         {
           console.error(error);
           return false;
    });
  }






  generateYear(yearLength){
    let yearArr = [];
    let year = new Date().getFullYear();
    for (let index = 0; index < yearLength; index++) {
      yearArr.push({name: year, value: year});
      year += 1;      
    }
     return yearArr;
  }





  generateMonth(){
    return [
      {name: '01', value: '01'},
      {name: '02', value: '02'},
      {name: '03', value: '03'},
      {name: '04', value: '04'},
      {name: '05', value: '05'},
      {name: '06', value: '06'},
      {name: '07', value: '07'},
      {name: '08', value: '08'},
      {name: '09', value: '09'},
      {name: '10', value: '10'},
      {name: '11', value: '11'},
      {name: '12', value: '12'}
    ];
  }


}





