import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { ComponentsModule } from "@shared/components/components.module";
import { SharedModule } from "@shared/shared.module";

import { QRCodeModule } from "angularx-qrcode";
import { PlasmaPageComponent } from "./plasma-page/plasma-page.component";
import { PlasmaRoutingModule } from "./plasma-routing.module";

@NgModule({
  declarations: [PlasmaPageComponent],
  imports: [
    CommonModule,
    PlasmaRoutingModule,
    QRCodeModule,
    ComponentsModule,
    SharedModule,
    DragDropModule,
  ],
})
export class PlasmaModule {}
