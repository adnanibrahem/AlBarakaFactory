import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: 'signin',
    component: SigninComponent,
  },

  {
    path: 'page404',
    component: Page404Component,
  },
  {
    path: 'page500',
    component: Page500Component,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
