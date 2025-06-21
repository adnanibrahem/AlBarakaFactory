import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { ComponentsModule } from "@shared/components/components.module";
import { SharedModule } from "@shared/shared.module";

import { QRCodeModule } from "angularx-qrcode";
import { CNCRoutingModule } from "./cnc-routing.module";
import { CNCPageComponent } from "./cnc-page/cnc-page.component";

@NgModule({
  declarations: [CNCPageComponent],
  imports: [
    CommonModule,
    CNCRoutingModule,
    QRCodeModule,
    ComponentsModule,
    SharedModule,
    DragDropModule,
  ],
})
export class CNCModule {}
