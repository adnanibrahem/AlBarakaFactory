/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CategoryComponent } from "./Category/category.component";
import { BoxTransactionComponent } from "./BoxTransaction/boxtransaction.component";
import { AgentsComponent } from "./Agents/agents.component";
import { StoreComponent } from "./Store/store.component";
import { SupplierInvoiceComponent } from "./SupplierInvoice/supplierinvoice.component";
import { ManufacturingOrderComponent } from "./ManufacturingOrder/manufacturing-order.component";
import { WithdrawMaterialsComponent } from "./WithdrawMaterials/withdraw-materials.component";
import { AttendanceComponent } from "./Attendance/attendance.component";

const allRoutes: Routes = [
  { path: "agents", component: AgentsComponent },
  { path: "box", component: BoxTransactionComponent },
  { path: "category", component: CategoryComponent },
  { path: "store", component: StoreComponent },
  { path: "invoice", component: SupplierInvoiceComponent },
  { path: "mnforder", component: ManufacturingOrderComponent },
  { path: "withdraw", component: WithdrawMaterialsComponent },
  { path: "attend", component: AttendanceComponent },  
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class accountantRoutingModule {}
