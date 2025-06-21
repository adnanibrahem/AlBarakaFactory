/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DesignComponent } from "./design/design.component";

const allRoutes: Routes = [{ path: "design", component: DesignComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class DrawingRoutingModule {}
