/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UsersComponent } from "./Users/users.component";

const allRoutes: Routes = [{ path: "users", component: UsersComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
