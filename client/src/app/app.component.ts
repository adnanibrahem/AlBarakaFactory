import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { ManufacturingOrder } from './accountant/accountant.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})


export class AppComponent {
  currentUrl!: string;
  constructor(public _router: Router) {
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        /* empty */
      }
      window.scrollTo(0, 0);
    });
  }
}


export function decideStatus(m: ManufacturingOrder) {
  if (m.otherOrder) return; // Skip other orders
  
  if (m.done) {
    m.status = "مكتمل";
    return;
  }
  for (let i = 0; i < m.paths.length; i++) {
    const path = m.paths[i];
    if (path.done) continue; // Skip if the path is already done
    if (path.step === "cnc") {
      m.status = "سي ان سي";
      return;
    } else if (path.step === "plasma") {
      m.status = "بلازما";
      return;
    } else if (path.step === "cutting") {
      m.status = "مقص";
      return;
    } else if (path.step === "drawing") {
      m.status = "رسم";
      return;
    } else if (path.step === "bending") {
      m.status = "عواجة";
      return;
    }
  }
}
