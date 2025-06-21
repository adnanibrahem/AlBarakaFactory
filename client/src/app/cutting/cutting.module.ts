import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { ComponentsModule } from "@shared/components/components.module";
import { SharedModule } from "@shared/shared.module";

import { QRCodeModule } from "angularx-qrcode";
import { CuttingPageComponent } from "./cutting-page/cutting-page.component";
import { CuttingRoutingModule } from "./cutting-routing.module";

@NgModule({
  declarations: [CuttingPageComponent],
  imports: [
    CommonModule,
    CuttingRoutingModule,
    QRCodeModule,
    ComponentsModule,
    SharedModule,
    DragDropModule,
  ],
})
export class CuttingModule {}
