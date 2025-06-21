/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm.component";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { UnsubscribeOnDestroyAdapter } from "@shared/UnsubscribeOnDestroyAdapter";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MyHTTP } from "@core/service/myHttp.service";

import { AuthService } from "@core";
import { CommercialYear } from "app/admin/admin.model";
import { Agent, Invoice, InvoiceItems, Material } from "../accountant.model";

@Component({
  selector: "app-supplierinvoice",
  templateUrl: "./supplierinvoice.component.html",
  styleUrls: ["./supplierinvoice.component.scss"],
})
export class SupplierInvoiceComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<Invoice> = new MatTableDataSource();
  @ViewChild("pagi") pagi!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varInvoice = {} as Invoice;
  showSpinner = false;

  caption = "";
  displayedColumns = [
    "seq",
    "supplierTitle",
    "invoiceDate",
    "invoiceCode",
    "totalCost",
    "comments",
    "actions",
  ];
  title = "سحب مواد مخزنية";
  dSItems: MatTableDataSource<InvoiceItems> = new MatTableDataSource();
  varSupInv: Invoice = {} as Invoice;

  agentList: Agent[] = [];
  LoadagentList() {
    this.http.list("agents", "agent/list").subscribe((e: any) => {
      this.agentList = e;
    });
  }

  appApi = "agents";
  appApiURL = "invoice/";
  cmYear: CommercialYear = {} as CommercialYear;

  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private auth: AuthService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.LoadagentList();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadInvoice();
        this.LoadmaterialList();
      }
    });
  }

  disColumnsItems = [
    "seq",
    "title",
    "unitPrice",
    "quantity",
    "total",
    "actions",
  ];

  agentFN(edt: any) {
    if (edt) {
      this.varSupInv.agent = edt.id;
      this.varSupInv.agentTitle = edt.title;
    }
  }

  isValid(ed: Invoice): boolean {
    for (let i = 0; i < ed.items.length; i++) {
      const t = ed.items[i];
      if (t.quantity == 0 || !t.material) return true;
    }
    if (this.varSupInv.totalCost != this.totalInput) return true;
    return false;
  }

  LoadInvoice() {
    this.showSpinner = true;
    this.http
      .list(this.appApi, this.appApiURL + "list/" + this.cmYear.id)
      .subscribe(
        (e: any) => {
          this.dataSource = new MatTableDataSource(e);
          this.dataSource.paginator = this.pagi;
          this.showSpinner = false;
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  MatrialFN(edt: any, row: any) {
    if (edt) {
      row.material = edt.id;
      row.materialTitle = edt.title;
    }
  }

  BranchFN(edt: any, row: any) {
    if (edt) {
      row.branch = edt.id;
      row.branchTitle = edt.title;
    }
  }

  addNewItems() {
    const t = {} as InvoiceItems;
    t.quantity = 0;
    t.id = -1;
    t.material = -1;
    t.materialTitle = "";
    this.dSItems.data.push(t);
    this.dSItems._updateChangeSubscription();
  }

  totalInput = 0;
  onChangeRow(ed: any) {
    this.totalInput = 0;
    this.dSItems.data.forEach((t) => {
      this.totalInput += t.quantity * t.unitCostPrice;
    });
  }

  materialList: Material[] = [];
  LoadmaterialList() {
    this.http.list(this.appApi, "material/title/list").subscribe((e: any) => {
      this.materialList = e;
    });
  }

  addNew() {
    this.varSupInv = {} as Invoice;
    this.caption = " تسجيل شراء مواد ";
    this.varSupInv.currency = true;
    this.varSupInv.items = [];
    this.dSItems = new MatTableDataSource(this.varSupInv.items);
    this.onChangeRow(null);
    this.selectedIndex = 1;
  }

  editCall(ed: Invoice) {
    this.varSupInv = ed;
    this.dSItems = new MatTableDataSource(this.varSupInv.items);
    this.dSItems._updateChangeSubscription();
    this.caption = " تعديل وصل المواد ";
    this.selectedIndex = 1;
    this.onChangeRow(null);
  }

  onSubmit() {
    const dt = this.varSupInv;
    this.showSpinner = true;
    if (!dt.comments) dt.comments = "";

    dt.invoiceDate = this.datePipe.transform(dt.invoiceDate, "yyyy-MM-dd");
    if (dt.id) {
      this.http.update(this.appApi, this.appApiURL + "edit", dt).subscribe(
        (e: any) => {
          this.showSpinner = false;
          if (dt.id != -1) {
            const t = this.dataSource.data.findIndex((x) => x.id == e.id);
            this.dataSource.data[t] = Object.assign(e);
          } else this.dataSource.data.push(e);
          this.dataSource._updateChangeSubscription();
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
          this.selectedIndex = 0;
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
    } else
      this.http.create(this.appApi, this.appApiURL + "create", dt).subscribe(
        (e: any) => {
          this.showSpinner = false;
          this.dataSource.data.push(e);
          this.dataSource._updateChangeSubscription();
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
          this.selectedIndex = 0;
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
  }
  deleteFatoraItem(i: number, row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: row.materialTitle },
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        if (row.id != -1) {
          this.http
            .delete(this.appApi, "invoice/item/edit", row)
            .subscribe((e: any) => {
              this.dSItems.data.splice(i, 1);
              this.dSItems._updateChangeSubscription();
              this.onChangeRow(null);
            });
        } else {
          this.dSItems.data.splice(i, 1);
          this.dSItems._updateChangeSubscription();
          this.onChangeRow(null);
        }
      }
    });
  }

  deleteItem(i: number, row: Invoice) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: row.agentTitle },
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http.delete(this.appApi, "invoice/edit", row).subscribe(
          () => {
            const idx = this.dataSource.data.findIndex((x) => x.id == row.id);
            if (idx > -1) {
              this.dataSource.data.splice(idx, 1);
              this.dataSource._updateChangeSubscription();
              this.http.showNotification("snackbar-success", "تم الحدف بنجاح");
            }
          },
          (err) => {
            this.http.showNotification("snackbar-danger", "لا يمكن حذف الوصل");
          }
        );
      }
    });
  }

  showInfo(row: Invoice) {
    console.log(row);
  }
}
