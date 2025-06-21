import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminRoutingModule } from "./admin-routing.module";

import { ComponentsModule } from "@shared/components/components.module";
import { SharedModule } from "@shared/shared.module";
import { UsersComponent } from "./Users/users.component";
import { QRCodeModule } from "angularx-qrcode";
import { TruncatePipe } from "@core/pipes";

@NgModule({
  declarations: [UsersComponent, TruncatePipe],
  imports: [
    CommonModule,
    AdminRoutingModule,
    QRCodeModule,
    ComponentsModule,
    SharedModule,
  ],
})
export class AdminModule {}
