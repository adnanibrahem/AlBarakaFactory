/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm.component";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { UnsubscribeOnDestroyAdapter } from "@shared/UnsubscribeOnDestroyAdapter";
import { MyHTTP } from "@core/service/myHttp.service";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { AuthService, User } from "@core";
import { interval, Subscription } from "rxjs";

import { CommercialYear } from "app/admin/admin.model";
import { UntypedFormControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";

import { environment } from "environments/environment";
import {
  ManufacturingOrder,
  ManufacturingPath,
} from "app/accountant/accountant.model";
import { decideStatus } from "app/app.component";

@Component({
  selector: "app-plasma-page",
  templateUrl: "./plasma-page.component.html",
  styleUrls: ["./plasma-page.component.scss"],
})
export class PlasmaPageComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<ManufacturingPath> = new MatTableDataSource();
  @ViewChild("paginator") pagi!: MatPaginator;
  @ViewChild("pagBoxDetails") pagBoxDetails!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varManufacturingPath = {} as ManufacturingPath;
  showSpinner = false;
  caption = "";
  totalDenar = 0;
  totalDollar = 0;
  curUser: User = {} as User;
  displayedColumns = [
    "seq",
    "title",
    "image",
    "files",
    "dateAt",
    "items",

    "actions",
  ];

  title = "طلبات بلازما";

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
    this.LoadManufacturingPath();

    this.refreshSubscription = this.subs.sink = interval(30000).subscribe(
      () => {
        this.LoadManufacturingPath();
      }
    );
  }
 
  LoadManufacturingPath() {
    this.showSpinner = true;
    this.http.list("box", "manufacturingPath/list").subscribe(
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

  pathPointsDone: any = [];
  pathPoints = [
    { index: 0, title: "سي ان سي", value: "cnc" },
    { index: 1, title: "بلازما", value: "plasma" },
    { index: 2, title: "مقص", value: "cutting" },
    { index: 3, title: "عواجة", value: "bending" },
  ];
  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    event.container.data.forEach((t: any, index: number) => {
      t.index = index + 1;
    });
    event.previousContainer.data.forEach((t: any, index: number) => {
      t.index = index + 1;
    });
  }

  //  ---------------- pictures

  loading = false;
  showFullScreenImage: boolean = false;
  fullScreenImageUrl: string = '';
  fullScreenImageTitle: string = '';

  imgClick(image: any, agentTitle: string) {
    this.fullScreenImageUrl = environment.imgUrl + image.image;
    this.fullScreenImageTitle = agentTitle;
    this.showFullScreenImage = true;
  }

  closeFullScreenImage() {
    this.showFullScreenImage = false;
    this.fullScreenImageUrl = '';
    this.fullScreenImageTitle = '';
  }
  //  ------------End pictures

  getPathTitle(value: string): string {
    const path = this.pathPoints.find((p) => p.value === value);
    return path ? path.title : value;
  }

  private updateDataSource(newData: ManufacturingPath[]): void {
    const currentData = this.dataSource.data;
    currentData.forEach((item) => {
      item.deleteByUpdate = true;
    }); // Ensure currentData is initialized
    newData.forEach((item) => {
      const existingItemIndex = currentData.findIndex((x) => x.id === item.id);
      if (existingItemIndex > -1) {
        currentData[existingItemIndex].deleteByUpdate = false; // Mark existing items as not deleted
        decideStatus(currentData[existingItemIndex].orderInfo); // Decide status for existing item
        // Update existing item
      } else {
        item.deleteByUpdate = false; // Mark new items as not deleted
        currentData.push(item);
        decideStatus(item.orderInfo); // Decide status for new item
      }
    });

    this.dataSource._updateChangeSubscription(); // Notify table of changes
  }
  SetDone(row: ManufacturingPath) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: {
        txt: "هل انت متأكد من انجاز العمل للعميل   ؟",
        title: row.orderInfo.agentTitle,
      },
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http.list("box", "manufacturingPath/finish/" + row.id).subscribe(
          () => {
            const idx = this.dataSource.data.findIndex((x) => x.id == row.id);
            if (idx > -1) {
              this.dataSource.data.splice(idx, 1);
              this.dataSource._updateChangeSubscription();
              this.http.showNotification(
                "snackbar-success",
                "تم الانجاز بنجاح"
              );
            }
          },
          () => {
            this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          }
        );
      }
    });
  }
}
