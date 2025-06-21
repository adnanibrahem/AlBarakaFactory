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

import { AuthService, User } from "@core";
import { Material, StoreItemDetails } from "../accountant.model";
import { CommercialYear } from "app/admin/admin.model";

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<Material> = new MatTableDataSource();
  @ViewChild("paginator") pagi!: MatPaginator;
  @ViewChild("pagBoxDetails") pagBoxDetails!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varMaterial = {} as Material;
  showSpinner = false;
  gFormGroup!: UntypedFormGroup;
  caption = "";
  totalDenar = 0;
  totalDollar = 0;
  curUser: User = {} as User;
  displayedColumns = [
    "seq",
    "title",
    "length",
    "width",
    "thickness",
    "unitCostPrice",
    "initQuantity",
    "quantity",
    "actions",
  ];
  title = "المخزن الرئيسي";
  calcTotalAll() {
    this.totalDenar = 0;
    this.totalDollar = 0;

    this.dataSource.data.forEach((t) => {
      if (t.currency) this.totalDenar += t.quantity * t.unitcost;
      else this.totalDollar += t.quantity * t.unitcost;
    });
  }
  newFormGroup(): UntypedFormGroup {
    return this.fb.group({
      id: [],
      title: [],
      length: [],
      width: [],
      thickness: [],
      initQuantity: [],
      initUnitCostPrice: [],
      initCurrency: [true],
    });
  }
  cloneFormGroup(dt: Material): UntypedFormGroup {
    return this.fb.group({
      id: [dt.id],
      initId: [dt.initId],
      title: [dt.title],
      length: [dt.length],
      width: [dt.width],
      thickness: [dt.thickness],
      initQuantity: [dt.initQuantity],
      initUnitCostPrice: [dt.initUnitCostPrice],
      initCurrency: [dt.initCurrency],
    });
  }

  LoadMaterialQuantity(material: Material) {
    material.spinner = true;
    this.http
      .list(
        "agents",
        "material/ballnce/0/" + material.id + "/" + this.cmYear.id
      )
      .subscribe(
        (e: any) => {
          material.initId = e.initId;
          material.initCurrency = e.initCurrency;
          material.initQuantity = e.initQuantity;
          material.initUnitCostPrice = e.initUnitCostPrice;
          material.quantity = e.quantity;
          material.spinner = false;
          material.currency = e.lastCurrency;
          material.unitcost = e.lastCost;
          this.calcTotalAll();
        },
        () => {
          material.spinner = false;
        }
      );
  }

  appApi = "store";
  appApiURL = "mainStore/";
  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private auth: AuthService,
    private datePipe: DatePipe
  ) {
    super();
  }

  cmYear: CommercialYear = {} as CommercialYear;

  ngOnInit(): void {
    this.curUser = this.auth.currentUserValue;
    this.gFormGroup = this.newFormGroup();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadMaterial();
      }
    });
  }

  LoadMaterial() {
    this.showSpinner = true;
    this.http.list("agents", "material/list").subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.data.forEach((k) => {
          this.LoadMaterialQuantity(k);
        });
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
  addNew() {
    this.gFormGroup = this.newFormGroup();
    this.caption = " تسجيل مادة مخزنية ";
    this.selectedIndex = 1;
  }

  editCall(ed: Material) {
    this.gFormGroup = this.cloneFormGroup(ed);
    this.caption = " تعديل بيانات مادة مخزنية ";
    this.selectedIndex = 1;
  }

  onSubmit() {
    const dt = this.gFormGroup.getRawValue();

    this.showSpinner = true;
    if (dt.id) {
      this.http.updateId("agents", "material/edit", dt, dt.id).subscribe(
        (e: any) => {
          const t = this.dataSource.data.findIndex((x) => x.id == e.id);
          this.dataSource.data[t] = Object.assign(e);
          this.LoadMaterialQuantity(this.dataSource.data[t]);
          this.dataSource._updateChangeSubscription();
          this.showSpinner = false;
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
    } else {
      this.http.create("agents", "material/create", dt).subscribe(
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
  }
  deleteMaterial(i: number, row: Material) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: row.title },
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .delete(this.appApi, this.appApiURL + "edit", row)
          .subscribe(() => {
            const idx = this.dataSource.data.findIndex((x) => x.id == row.id);
            if (idx > -1) {
              this.dataSource.data.splice(idx, 1);
              this.dataSource._updateChangeSubscription();
              this.http.showNotification("snackbar-success", "تم الحدف بنجاح");
            }
          });
      }
    });
  }

  deleteItem(i: number, row: Material) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: row.title },
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http.delete("agents", "material/edit", row).subscribe(() => {
          const idx = this.dataSource.data.findIndex((x) => x.id == row.id);
          if (idx > -1) {
            this.dataSource.data.splice(idx, 1);
            this.dataSource._updateChangeSubscription();
            this.http.showNotification("snackbar-success", "تم الحدف بنجاح");
          }
        });
      }
    });
  }
  dipBoxDetaise = ["sq", "balance", "type", "quantity", "date", "comments"];
  MaterialsListDet: StoreItemDetails[] = [];
  MaterialsDetals: MatTableDataSource<StoreItemDetails> =
    new MatTableDataSource();
  detailsMaterial(Material: Material) {
    this.caption =
      Material.title +
      " × " +
      Material.length +
      " × " +
      Material.width +
      " × " +
      Material.thickness;
    this.http
      .list(
        "agents",
        "material/ballnce/1/" + Material.id + "/" + this.cmYear.id
      )
      .subscribe((e: any) => {
        Material.quantity = e.quantity;
        Material.details = e.details;
        Material.details.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));

        let balance = Material.initQuantity;
        const t = {} as StoreItemDetails;
        t.balance = Material.initQuantity;
        t.comments = "بداية الرصيد";
        this.MaterialsListDet = [];
        this.MaterialsListDet.push(t);
        Material.details.forEach((k: any) => {
          const w = {} as StoreItemDetails;

          w.quantity = k.d.quantity;
          w.date = k.date;
          if (k.type.trim() === "withdraw") {
            w.type = "سحب";
            balance -= k.d.quantity;
            w.comments = "سحب الى " + k.d.destination;
          }
          if (k.type.trim() === "invoiceItem") {
            w.type = "وارد ";
            balance += k.d.quantity;
            w.comments = " شراء مواد من " + k.agentTitle;
          }
          w.balance = balance;
          this.MaterialsListDet.push(w);
        });
        this.MaterialsDetals.data = this.MaterialsListDet;
        this.MaterialsDetals._updateChangeSubscription();
        this.MaterialsDetals.paginator = this.pagBoxDetails;
        this.selectedIndex = 2;
      });
  }
}
