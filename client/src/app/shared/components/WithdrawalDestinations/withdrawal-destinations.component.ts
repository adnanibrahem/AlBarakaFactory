/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { Destination } from "app/accountant/accountant.model";
import { MyHTTP } from "@core/service/myHttp.service";

@Component({
  selector: "app-withdrawal-destinations",
  templateUrl: "./withdrawal-destinations.component.html",
  styleUrls: ["./withdrawal-destinations.component.scss"],
})
export class WithdrawalDestinationsDialogComponent {
  items = "";
  title = "";
  constructor(
    public dialogRef: MatDialogRef<WithdrawalDestinationsDialogComponent>,
    private http: MyHTTP
  ) {
    this.title = " الوجهات المستفيدة من سحب المواد";
  }

  destinationList: Destination[] = [];
  LoadDestinationList() {
    this.http.list("agents", "destination/list").subscribe((e: any) => {
      this.destinationList = e;
    });
  }

  ngOnInit() {
    this.LoadDestinationList();
  }
  onSave(x: Destination) {
    if (x.id === 0) {
      // إضافة وجهة جديدة
      this.http.create("agents", "destination/create", x).subscribe(
        (res: any) => {
          x.id = res.id; // تحديث id بعد الإضافة
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
        },
        () => {
          this.http.showNotification("snackbar-error", "حدث خطأ أثناء الحفظ");
        }
      );
    } else {
      // تحديث وجهة موجودة
      this.http.update("agents", "destination/edit", x).subscribe(
        (res: any) => {
          this.http.showNotification("snackbar-success", "تم التحديث بنجاح");
        },
        () => {
          this.http.showNotification("snackbar-error", "حدث خطأ أثناء التحديث");
        }
      );
    }
    x.save = false;
  }

  onDelete(x: Destination) {
    if (x.id === 0) {
      this.destinationList = this.destinationList.filter(
        (item) => item.id !== x.id
      );
    } else {
      this.http.delete("agents", "destination/edit", x).subscribe(
        () => {
          this.destinationList = this.destinationList.filter(
            (item) => item.id !== x.id
          );
          this.http.showNotification("snackbar-success", "تم الحذف بنجاح");
        },
        () => {
          this.http.showNotification("snackbar-error", "حدث خطأ أثناء الحذف");
        }
      );
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onAdd(): void {
    const newDestination: Destination = {
      id: 0,
      title: "",
      save: false, // هل تم حفظها
    };
    this.destinationList.push(newDestination);
  }
}
