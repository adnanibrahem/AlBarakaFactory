import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { ComponentsModule } from "@shared/components/components.module";
import { SharedModule } from "@shared/shared.module";

import { QRCodeModule } from "angularx-qrcode";
import { BendingPageComponent } from "./cutting-page/bending-page.component";
import { BendingRoutingModule } from "./bending-routing.module";

@NgModule({
  declarations: [BendingPageComponent],
  imports: [
    CommonModule,
    BendingRoutingModule,
    QRCodeModule,
    ComponentsModule,
    SharedModule,
    DragDropModule,
  ],
})
export class BendingModule {}
