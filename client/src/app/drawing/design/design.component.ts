/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm.component";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { UnsubscribeOnDestroyAdapter } from "@shared/UnsubscribeOnDestroyAdapter";
import { MyHTTP } from "@core/service/myHttp.service";
import { AuthService, User } from "@core";
import { interval, Subscription } from "rxjs";

import { CommercialYear } from "app/admin/admin.model";
import { UntypedFormControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";

import { environment } from "environments/environment";
import {
  ManufacturingFiles,
  ManufacturingImages,
  ManufacturingOrder,
  ManufacturingPath,
} from "app/accountant/accountant.model";
import { decideStatus } from "app/app.component";

@Component({
  selector: "app-design",
  templateUrl: "./design.component.html",
  styleUrls: ["./design.component.scss"],
})
export class DesignComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<ManufacturingOrder> = new MatTableDataSource();
  @ViewChild("paginator") pagi!: MatPaginator;
  @ViewChild("pagBoxDetails") pagBoxDetails!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varManufacturingOrder = {} as ManufacturingOrder;
  showSpinner = false;
  caption = "";
  totalDenar = 0;
  totalDollar = 0;
  curUser: User = {} as User;
  displayedColumns = ["seq", "title", "dateAt", "status"];

  title = "طلبات التصنيع";

  appApi = "store";
  appApiURL = "mainStore/";
  constructor(
    private http: MyHTTP,
    private dialog: MatDialog,
    private auth: AuthService,
    protected sanitizer: DomSanitizer,

    private datePipe: DatePipe
  ) {
    super();
  }
  cmYear: CommercialYear = {} as CommercialYear;
  private refreshSubscription!: Subscription;

  ngOnInit(): void {
    this.curUser = this.auth.currentUserValue;
    this.LoadManufacturingOrder();

    this.refreshSubscription = this.subs.sink = interval(10000).subscribe(
      () => {
        this.LoadManufacturingOrder();
      }
    );
  }



  LoadManufacturingOrder() {
    this.showSpinner = true;
    this.http.list("box", "manufacturingOrder/list").subscribe(
      (e: any) => {
        this.dataSource.paginator = this.pagi; // Re-assign paginator in case it was lost or for initial setup
        this.updateDataSource(e);
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
    this.varManufacturingOrder = {} as ManufacturingOrder;
    this.varManufacturingOrder.images = [];
    this.varManufacturingOrder.designFile = new UntypedFormControl();
    this.varManufacturingOrder.currency = true;
    this.varManufacturingOrder.paths = []; // Initialize paths
    this.caption = " تسجيل مادة مخزنية ";
    this.selectedIndex = 1;
  }

  editCall(ed: ManufacturingOrder) {
    this.varManufacturingOrder = ed;
    this.dataSource.data.forEach((t) => {
      t.selected = false;
    });
    this.varManufacturingOrder.selected = true;
    this.varManufacturingOrder.fileName = "";
    if (
      this.varManufacturingOrder.designFile !== null &&
      this.varManufacturingOrder.designFile != undefined
    ) {
      this.varManufacturingOrder.fileName = (
        decodeURIComponent(this.varManufacturingOrder.designFile)
          .split("/")
          .pop() ?? ""
      ).toString();
    }

    this.varManufacturingOrder.images.forEach((t) => {
      if (t?.image) {
        t.obj = new UntypedFormControl();
        t.obj.setValue(environment.imgUrl + t.image);
      }
    });
    this.caption = " تعديل بيانات مادة مخزنية ";
  }
 
  onFileSelected(fileList: FileList | null): void {
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.varManufacturingOrder.designFile = new UntypedFormControl();
      this.varManufacturingOrder.designFile.setValue(file);
    }
  }

  onSubmit() {
    const dt = this.varManufacturingOrder;
    let fd = new FormData();
    if (dt.designFile && dt.designFile.value) {
      fd.append("designFile", dt.designFile.value, dt.designFile.value.name);
    }

    fd.append("agent", dt.agent.toString());
    fd.append("comments", dt.comments);
    fd.append("yearId", dt.yearId.toString());
    fd.append("userAuth", this.curUser.id.toString());
    fd.append("currency", dt.currency.toString());
    fd.append("price", dt.price.toString());
    fd.append("id", dt.id.toString());
    fd.append("paths", JSON.stringify(dt.paths));
    
    this.showSpinner = true;

    this.http.update("box", "manufacturingOrder/edit", fd).subscribe(
      (e: any) => {
        const t = this.dataSource.data.findIndex((x) => x.id == e.id);
        this.dataSource.data[t] = Object.assign(e);
        decideStatus(e);
        this.dataSource._updateChangeSubscription();
        this.showSpinner = false;
        this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
      },
      () => {
        this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
        this.showSpinner = false;
      }
    );
  }

  deleteManufacturingOrder(i: number, row: ManufacturingOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: row.agentTitle },
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
  detailsManufacturingOrder(ed: ManufacturingOrder) {}

  //  ---------------- pictures

  showImagePreview(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const showPictureFile = new UntypedFormControl();
      showPictureFile.setValue(
        this.sanitizer.bypassSecurityTrustUrl(reader.result as string)
      );
      const doc = {} as ManufacturingImages;
      doc.obj = showPictureFile;
      doc.objFile = file;
      this.varManufacturingOrder.images.push(doc);
    };
  }
  loading = false;

  imgClick(x: any) {
    window.open(environment.imgUrl + x.image);
  }
  //  ------------End pictures

 

  private updateDataSource(newData: ManufacturingOrder[]): void {
    const currentData = this.dataSource.data;
    currentData.forEach((item) => {
      item.deleteByUpdate = true;
    }); // Ensure currentData is initialized
    newData.forEach((item) => {
      const existingItemIndex = currentData.findIndex((x) => x.id === item.id);
      if (existingItemIndex > -1) {
        currentData[existingItemIndex].deleteByUpdate = false; // Mark existing items as not deleted
        currentData[existingItemIndex].paths = item.paths; // Mark existing items as not deleted
         decideStatus(currentData[existingItemIndex]); // Decide status for existing item
        // Update existing item
      } else {
        item.deleteByUpdate = false; // Mark new items as not deleted
        currentData.push(item);
         decideStatus(item); // Decide status for new item
      }
    });

    this.dataSource._updateChangeSubscription(); // Notify table of changes
  }
}
