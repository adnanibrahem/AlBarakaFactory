/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CNCPageComponent } from "./cnc-page/cnc-page.component";

const allRoutes: Routes = [{ path: "page", component: CNCPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class CNCRoutingModule {}
