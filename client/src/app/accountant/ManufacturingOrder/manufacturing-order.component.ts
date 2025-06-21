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
import {
  Agent,
  ManufacturingImages,
  ManufacturingOrder,
} from "../accountant.model";
import { CommercialYear } from "app/admin/admin.model";
import { UntypedFormControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { WebcamImage } from "ngx-webcam";
import { WebcamDialogComponent } from "@shared/components/webcam-dialog/webcam-dialog.component";
import { generateId } from "@shared/TableElement";
import { environment } from "environments/environment";

@Component({
  selector: "app-manufacturing-order",
  templateUrl: "./manufacturing-order.component.html",
  styleUrls: ["./manufacturing-order.component.scss"],
})
export class ManufacturingOrderComponent
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
  displayedColumns = [
    "seq",
    "img",
    "title",
    "dateAt",
    "price",
    "status",
    "paths",
    "comments",
    "actions",
  ];

  title = "طلبات التصنيع";
  calcTotalAll() {
    this.totalDenar = 0;
    this.totalDollar = 0;

    this.dataSource.data.forEach((t) => {
      if (t.currency) this.totalDenar += t.price;
      else this.totalDollar += t.price;
    });
  }

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
  agentList: Agent[] = [];
  LoadagentList() {
    this.http.list("agents", "agent/list").subscribe((e: any) => {
      this.agentList = e;
    });
  }

  showAdvanceSearch = false;
  onAdvaceSearch() {
    this.showAdvanceSearch = !this.showAdvanceSearch;
    if (!this.showAdvanceSearch) {
      this.LoadManufacturingOrder();
    }
  }
  dateSearchTo = "";
  dateSearchFrom = "";
  doSearch() {
    this.LoadManufacturingOrder({
      dtFrom: this.datePipe.transform(this.dateSearchFrom, "yyyy-MM-dd"),
      dtTo: this.datePipe.transform(this.dateSearchTo, "yyyy-MM-dd"),
    });
  }
  ngOnInit(): void {
    this.curUser = this.auth.currentUserValue;
    this.LoadManufacturingOrder();
    this.LoadagentList();
  }

  agentFN(edt: any) {
    if (edt) {
      this.varManufacturingOrder.agent = edt.id;
      this.varManufacturingOrder.agentTitle = edt.title;
    }
  }

  decideStatus(m: ManufacturingOrder) {
    if (m.otherOrder) return; // Skip other orders
    if (m.done) {
      m.status = "مكتمل  ";
      return;
    }
    if (!m.paths || m.paths.length == 0) {
      m.status = "رسم";
      return;
    } else {
      for (let i = 0; i < m.paths.length; i++) {
        const path = m.paths[i];
        if (path.done) continue; // Skip if the path is already done
        if (path.step === "cnc") {
          m.status = "سي ان سي";
          return;
        } else if (path.step === "plasma") {
          m.status = "بلازما";
          return;
        } else if (path.step === "cutting") {
          m.status = "مقص";
          return;
        } else if (path.step === "bending") {
          m.status = "عواجة";
          return;
        }
      }
    }
  }

  LoadManufacturingOrder(js = {}) {
    this.showSpinner = true;
    this.http.post("box", "manufacturingOrder/list", js).subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.data.forEach((t) => {
          this.decideStatus(t);
        });
        this.dataSource.paginator = this.pagi;
        this.showSpinner = false;
        this.calcTotalAll();
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
    this.varManufacturingOrder.currency = true;
    this.caption = " تسجيل مادة مخزنية ";
    this.varManufacturingOrder.otherOrder = false;
    this.selectedIndex = 1;
  }

  otherRequest() {
    this.varManufacturingOrder = {} as ManufacturingOrder;
    this.varManufacturingOrder.images = [];
    this.varManufacturingOrder.currency = true;
    this.varManufacturingOrder.otherOrder = true;
    this.varManufacturingOrder.done = true;
    this.caption = " تسجيل طلبات اخرى";
    this.selectedIndex = 1;
  }
  editCall(ed: ManufacturingOrder) {
    this.varManufacturingOrder = ed;
    this.varManufacturingOrder.images.forEach((t) => {
      if (t?.image) {
        t.obj = new UntypedFormControl();
        t.obj.setValue(environment.imgUrl + t.image);
      }
    });
    this.caption = " تعديل بيانات مادة مخزنية ";
    this.selectedIndex = 1;
  }

  onSubmit() {
    //  const dt = this.varManufacturingOrder;
    let fd = new FormData();
    let kk = Object.entries(this.varManufacturingOrder);
    kk.forEach((kr) => {
      if (kr[0] != "designFile" && kr[0] != "images") {
        if (kr[0] == "paths") {
          kr[1].forEach((path: any) => {
            fd.append("paths[]", JSON.stringify(path));
          });
        } else if (kr[1] == "null") fd.append(kr[0], "");
        else fd.append(kr[0], kr[1]);
      }
    });

    this.showSpinner = true;
    if (this.varManufacturingOrder.id) {
      this.http.update("box", "manufacturingOrder/edit", fd).subscribe(
        (e: any) => {
          const t = this.dataSource.data.findIndex((x) => x.id == e.id);
          this.dataSource.data[t] = Object.assign(e);
          this.calcTotalAll();
          this.uploadNewPictures(this.varManufacturingOrder);
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
      this.http.create("box", "manufacturingOrder/create", fd).subscribe(
        (e: any) => {
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
          this.showSpinner = false;
          this.varManufacturingOrder.id = e.id;
          this.uploadNewPictures(this.varManufacturingOrder);
          this.dataSource.data.push(this.varManufacturingOrder);
          this.dataSource._updateChangeSubscription();
          this.calcTotalAll();
          this.selectedIndex = 0;
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
    }
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

  deleteItem(i: number, row: ManufacturingOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: row.agentTitle },
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .delete("box", "manufacturingOrder/edit", row)
          .subscribe(() => {
            const idx = this.dataSource.data.findIndex((x) => x.id == row.id);
            if (idx > -1) {
              this.dataSource.data.splice(idx, 1);
              this.dataSource._updateChangeSubscription();
              this.http.showNotification("snackbar-success", "تم الحدف بنجاح");
            }
            this.calcTotalAll();
          });
      }
    });
  }

  //  ---------------- pictures

  removeResetPicture(i: number) {
    if (this.varManufacturingOrder.images[i].id) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        height: "200px",
        width: "300px",
        data: {
          txt: "هل انت متأكد من حذف الصورة   ؟",
          title: "سيتم حذف هذه الصورة بشكل كامل ",
        },
        direction: "rtl",
      });
      this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
        if (result === 1) {
          this.http
            .delete(
              "box",
              "manufacturingImages/edit",
              this.varManufacturingOrder.images[i]
            )
            .subscribe(() => {
              this.varManufacturingOrder.images.splice(i, 1);
            });
        }
      });
    } else this.varManufacturingOrder.images.splice(i, 1);
  }

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

  translateStep(step: string) {
    switch (step) {
      case "cnc":
        return "سي ان سي";
      case "plasma":
        return "بلازما";
      case "cutting":
        return "مقص";
      case "bending":
        return "عواجة";
      default:
        return step;
    }
  }

  loading = false;
  resetFromLocalFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    if (fileList[0].type.split("/")[0] !== "image") {
      this.http.showNotification(
        "snackbar-danger",
        "يرجى اختيار ملف من نوع صورة"
      );
      return;
    }

    this.showImagePreview(fileList[0]);
  }

  DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(",");
    const byteString =
      splitDataURI[0].indexOf("base64") >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(":")[1].split(";")[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  uploadNewPictures(pb: ManufacturingOrder) {
    pb.images.forEach((k) => {
      if (!k.id) {
        const fd = new FormData();
        fd.append("order", pb.id.toString());
        if (k.objFile) fd.append("image", k.objFile);
        else {
          const file = this.DataURIToBlob(
            k.obj.value.changingThisBreaksApplicationSecurity
          );
          fd.append("image", file, "image.jpg");
        }
        this.showSpinner = true;
        this.http
          .create("box", "manufacturingImages/create", fd)
          .subscribe((e: any) => {
            this.showSpinner = false;
            const pbk = this.dataSource.data.find((x) => x.id == pb.id);
            if (pbk) {
              e.obj = k.obj;
              pbk.images.push(e);
            }
          });
      }
    });
  }

  imgClick(x: any) {
    window.open(environment.imgUrl + x.image);
  }
  //  ------------End pictures

  //////////////////////////  image from camers
  addImageFromWebcam() {
    const dialogRef = this.dialog.open(WebcamDialogComponent, {
      autoFocus: true,
    });
    dialogRef.afterClosed().subscribe((webcamImage: WebcamImage) => {
      if (webcamImage) {
        // this.uploadImg = true;
        const newFile = this.returnFileFromWebcam(webcamImage);
        // this.groupForm!.get('img')!.setValue(newFile);
        this.showImagePreview(newFile);
      }
    });
  }
  returnFileFromWebcam(webcam: WebcamImage): File {
    const imageName = generateId(12) + ".png";
    const imageBlob = this.dataURItoBlob(webcam.imageAsBase64);
    return new File([imageBlob], imageName, { type: "image/png" });
  }
  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: "image/png" });
    return blob;
  }
  ///////////////////////////
}
