import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { ComponentsModule } from "@shared/components/components.module";
import { SharedModule } from "@shared/shared.module";

import { QRCodeModule } from "angularx-qrcode";

import { DrawingRoutingModule } from "./drawing-routing.module";
import { DesignComponent } from "./design/design.component";

@NgModule({
  declarations: [DesignComponent],
  imports: [
    CommonModule,
    DrawingRoutingModule,
    QRCodeModule,
    ComponentsModule,
    SharedModule,
    DragDropModule,
  ],
})
export class DrawingModule {}
