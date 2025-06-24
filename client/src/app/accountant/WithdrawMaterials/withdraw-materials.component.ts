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
import {
  Destination,
  WithdrawItems,
  Withdraw,
  Material,
} from "../accountant.model";
import { WithdrawalDestinationsDialogComponent } from "@shared/components/WithdrawalDestinations/withdrawal-destinations.component";

@Component({
  selector: "app-withdraw-materials",
  templateUrl: "./withdraw-materials.component.html",
  styleUrls: ["./withdraw-materials.component.scss"],
})
export class WithdrawMaterialsComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<Withdraw> = new MatTableDataSource();
  @ViewChild("pagi") pagi!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varWithdraw = {} as Withdraw;
  showSpinner = false;

  caption = "";
  displayedColumns = [
    "seq",
    "destinationTitle",
    "WithdrawDate",
    "itemsList",
    "comments",
    "actions",
  ];
  title = " سحب مواد";
  dSItems: MatTableDataSource<WithdrawItems> = new MatTableDataSource();

  destinationList: Destination[] = [];
  LoadDestinationList() {
    this.http.list("agents", "destination/list").subscribe((e: any) => {
      this.destinationList = e;
    });
  }

  
  destinatios() {
    const dialogRef = this.dialog.open(WithdrawalDestinationsDialogComponent, {
      height: "750px",
      width: "600px",
      data: this.varWithdraw,
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      this.LoadDestinationList();
    });
  }
  appApi = "agents";
  appApiURL = "withdraw/";
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
    this.LoadDestinationList();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadWithdraw();
        this.LoadmaterialList();
      }
    });
  }

  disColumnsItems = ["seq", "title", "quantity", "actions"];

  destinationFN(edt: any) {
    if (edt) {
      this.varWithdraw.destination = edt.id;
      this.varWithdraw.destinationTitle = edt.title;
    }
  }

  isValid(ed: Withdraw): boolean {
    for (let i = 0; i < ed.items.length; i++) {
      const t = ed.items[i];
      if (t.quantity == 0 || !t.material) return true;
    }

    return false;
  }

  LoadWithdraw() {
    this.showSpinner = true;
    this.http.list(this.appApi, this.appApiURL + "list").subscribe(
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
    const t = {} as WithdrawItems;
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
    this.varWithdraw = {} as Withdraw;
    this.caption = " تسجيل سحب مواد ";
    this.varWithdraw.items = [];
    this.dSItems = new MatTableDataSource(this.varWithdraw.items);
    this.onChangeRow(null);
    this.selectedIndex = 1;
  }

  editCall(ed: Withdraw) {
    this.varWithdraw = ed;
    this.dSItems = new MatTableDataSource(this.varWithdraw.items);
    this.dSItems._updateChangeSubscription();
    this.caption = " تعديل وصل المواد ";
    this.selectedIndex = 1;
    this.onChangeRow(null);
  }

  onSubmit() {
    const dt = this.varWithdraw;
    this.showSpinner = true;
    if (!dt.comments) dt.comments = "";

    dt.withdrawDate = this.datePipe.transform(dt.withdrawDate, "yyyy-MM-dd");
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
            .delete(this.appApi, "Withdraw/item/edit", row)
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

  deleteItem(i: number, row: Withdraw) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: row.destinationTitle },
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http.delete(this.appApi, "Withdraw/edit", row).subscribe(
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

  showInfo(row: Withdraw) {
    console.log(row);
  }
}
