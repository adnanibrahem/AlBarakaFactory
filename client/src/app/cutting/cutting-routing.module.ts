/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CuttingPageComponent } from "./cutting-page/cutting-page.component";

const allRoutes: Routes = [{ path: "page", component: CuttingPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class CuttingRoutingModule {}
