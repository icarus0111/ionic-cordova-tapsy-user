import { Injectable } from '@angular/core';

interface Scripts {
  name: string;
  src: string;
}

//--------------------------------------------------
//  all lists of third party libraries
//--------------------------------------------------

export const ScriptStore: Scripts[] = [
  { name: 'jquery', src: '../../assets/js/core/jquery.3.2.1.min.js' },
  { name: 'popper', src: '../../assets/js/core/popper.min.js' },
  { name: 'bootstrapjs', src: '../../assets/js/core/bootstrap.min.js' },
  { name: 'webfont', src: '../../assets/js/plugin/webfont/webfont.min.js' },
  { name: 'chartjs', src: '../../assets/js/plugin/chart.js/chart.min.js' },
  { name: 'chartcircle', src: '../../assets/js/plugin/chart-circle/circles.min.js' },
  { name: 'jqueryui', src: '../../assets/js/plugin/jquery-ui-1.12.1.custom/jquery-ui.min.js' },
  { name: 'jqueryuitouchpunch', src: '../../assets/js/plugin/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js' },
  { name: 'datatables', src: '../../assets/js/plugin/datatables/datatables.min.js' },
  { name: 'bootstrapnotify', src: '../../assets/js/plugin/bootstrap-notify/bootstrap-notify.min.js' },
  { name: 'vmap', src: '../../assets/js/plugin/jqvmap/jquery.vmap.min.js' },
  { name: 'vmapworld', src: '../../assets/js/plugin/jqvmap/maps/jquery.vmap.world.js' },
  { name: 'sweetalert', src: '../../assets/js/plugin/sweetalert/sweetalert.min.js' },
  { name: 'atlantis', src: '../../assets/js/atlantis.min.js' },
  { name: 'settingdemo', src: '../../assets/js/setting-demo.js' },
  { name: 'demo', src: '../../assets/js/demo.js' }
];

declare var document: any;

@Injectable({
  providedIn: 'root'
})
export class DynamicScriptLoaderService {

  private scripts: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }


//--------------------------------------------------
//  loads libraries to the project
//--------------------------------------------------
  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }


//--------------------------------------------------
//  take particular libraries link and creates script tag 
//--------------------------------------------------
  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      if (!this.scripts[name].loaded) {
        //load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  //IE
            script.onreadystatechange = () => {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    this.scripts[name].loaded = true;
                    resolve({script: name, loaded: true, status: 'Loaded'});
                }
            };
        } else {  //Others
            script.onload = () => {
                this.scripts[name].loaded = true;
                resolve({script: name, loaded: true, status: 'Loaded'});
            };
        }
        script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
    });
  }



}
