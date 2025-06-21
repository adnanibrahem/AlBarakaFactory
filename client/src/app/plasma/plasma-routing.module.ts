/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PlasmaPageComponent } from "./plasma-page/plasma-page.component";

const allRoutes: Routes = [{ path: "page", component: PlasmaPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class PlasmaRoutingModule {}
