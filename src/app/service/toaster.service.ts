import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
// import { ToastrService } from 'ngx-toastr';
// import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  toastConfig: object = {
    timeOut: 5000,
    progressBar: true,
  }

  constructor(
    // private toastr: ToastrService
    public toastController: ToastController
    ) { }

  // showSuccess(message, title) {
  //   this.toastr.success(message, title, this.toastConfig);
  // }

  // showError(message, title) {
  //   this.toastr.error(message, title, this.toastConfig);
  // }

  // async showConfirmationAlert(title, text, type) {
    
  //     return Swal.fire({
  //       title,
  //       text,
  //       type,
  //       showCancelButton: true,
  //       confirmButtonText: 'Delete',
  //       cancelButtonText: 'Cancel'
  //     }).then((result) => {
  //       // console.log('alert action value :.................', result);  
  //       return result;    
  //       // if (result.value) {
  //         // Swal.fire(
  //         //   'Deleted!',
  //         //   'Your imaginary file has been deleted.',
  //         //   'success'
  //         // )
  //       // } else if (result.dismiss === Swal.DismissReason.cancel) {
  //         // Swal.fire(
  //         //   'Cancelled',
  //         //   'Your imaginary file is safe :)',
  //         //   'error'
  //         // )
  //       // }
  //     })
    
  // }




  async presentToast(header, message, color, duration) {
    return await this.toastController.create({
      header,
      message,
      duration,
      position: 'top',
      color 
    });
  }



}
