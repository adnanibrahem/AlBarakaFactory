/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BendingPageComponent } from "./bending-page/bending-page.component";

const allRoutes: Routes = [{ path: "page", component: BendingPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class BendingRoutingModule {}
