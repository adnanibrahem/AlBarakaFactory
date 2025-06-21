import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ComponentsModule } from "@shared/components/components.module";
import { SharedModule } from "@shared/shared.module";
import { accountantRoutingModule } from "./accountant-routing.module";
import { CategoryComponent } from "./Category/category.component";
import { BoxTransactionComponent } from "./BoxTransaction/boxtransaction.component";
import { AgentsComponent } from "./Agents/agents.component";
import { StoreComponent } from "./Store/store.component";
import { SupplierInvoiceComponent } from "./SupplierInvoice/supplierinvoice.component";
import { ManufacturingOrderComponent } from "./ManufacturingOrder/manufacturing-order.component";
import { WithdrawMaterialsComponent } from "./WithdrawMaterials/withdraw-materials.component";

@NgModule({
  declarations: [
    CategoryComponent,
    BoxTransactionComponent,
    StoreComponent,
    AgentsComponent,
    SupplierInvoiceComponent,
    ManufacturingOrderComponent,
    WithdrawMaterialsComponent,
  ],
  imports: [
    CommonModule,
    accountantRoutingModule,
    ComponentsModule,
    SharedModule,
  ],
})
export class accountantModule {}
