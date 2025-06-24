/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { Agent, Destination } from "app/accountant/accountant.model";
import { MyHTTP } from "@core/service/myHttp.service";

@Component({
  selector: "app-workers",
  templateUrl: "./workers.component.html",
  styleUrls: ["./workers.component.scss"],
})
export class WokersDialogComponent {
  items = "";
  title = "";
  constructor(
    public dialogRef: MatDialogRef<WokersDialogComponent>,
    private http: MyHTTP
  ) {
    this.title = " واجهة تسجيل الموظفين او العمال";
  }


  destinationList: Destination[] = [];
  LoadDestinationList() {
    this.http.list("agents", "destination/list").subscribe((e: any) => {
      this.destinationList = e;
    });
  }

  agentList: Agent[] = [];
  LoadAgentList() {
    this.http.list("agents", "agent/list/worker").subscribe((e: any) => {
      this.agentList = e;
    });
  }
  
  ngOnInit() {
    this.LoadDestinationList();
    this.LoadAgentList();
  }
  onSave(x: Agent) {
    if (!x.id) {
      this.http.create("agents", "agent/create", x).subscribe(
        (res: any) => {
          x.id = res.id;  
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
        },
        () => {
          this.http.showNotification("snackbar-error", "حدث خطأ أثناء الحفظ");
        }
      );
    } else {
      // تحديث وجهة موجودة
      this.http.update("agents", "agent/edit", x).subscribe(
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

  onDelete(x: Agent) {
    if (!x.id ) {
      this.agentList = this.agentList.filter(
        (item) => item.id !== x.id
      );
    } else {
      this.http.delete("agents", "agent/edit", x).subscribe(
        () => {
          this.agentList = this.agentList.filter(
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
    const newagent: Agent = {} as Agent;
    newagent.group = "worker";
    this.agentList.push(newagent);
  }
}
