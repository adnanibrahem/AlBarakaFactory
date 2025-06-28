/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { UnsubscribeOnDestroyAdapter } from "@shared/UnsubscribeOnDestroyAdapter";
import { UntypedFormBuilder,   } from "@angular/forms";
import { MyHTTP } from "@core/service/myHttp.service";

import { AuthService } from "@core";
import { Agent, Attendance, Destination, Salary } from "../accountant.model";
import { CommercialYear } from "app/admin/admin.model";
import { WokersDialogComponent } from "@shared/components/Workers/workers.component";

@Component({
  selector: "app-attendance",
  templateUrl: "./attendance.component.html",
  styleUrls: ["./attendance.component.scss"],
})
export class AttendanceComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  @ViewChild("paginator") pagi!: MatPaginator;
  @ViewChild("pagDetails") pagDetails!: MatPaginator;
  group = "worker"; // or "employee"
  isTablet = false;
  selectedIndex = 0;
  varAgent = {} as Agent;
  showSpinner = false;
  
  caption = "";
  displayedColumns = [
    "seq",
    "title",
    "address",
    "phoneNumber",
    "initDenar",
    "denar",
    "actions",
  ];

  title = " حضور وغياب الموظفين والعمال";
  isloading = false;
  appApi = "agents";
  appApiURL = "agent/";
  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
  }
  cmYear: CommercialYear = {} as CommercialYear;

  ngOnInit(): void {
    this.calculateDates();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) this.LoadAgent();
    });
  }
  calculateDates  (){
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
      let daysSinceLastSaturday;
      if (dayOfWeek === 6) {
        daysSinceLastSaturday = 0;
      } else {
        daysSinceLastSaturday = dayOfWeek + 1; // Days from last Saturday to today
      }
      const pastSaturday = new Date(today);
      pastSaturday.setDate(today.getDate() - daysSinceLastSaturday); // Subtract days to go back
       let daysUntilThursday = 4 - dayOfWeek; // Days until next Thursday
      if (daysUntilThursday <= 0) { 
        daysUntilThursday += 7;
      }
      const thursday = new Date(today);
    thursday.setDate(today.getDate() + daysUntilThursday);
      this.dateSearchFrom = pastSaturday;
      this.dateSearchTo = thursday;
  };
  
AddWorker() {
    const dialogRef = this.dialog.open(WokersDialogComponent, {
      height: "750px",
      width: Math.max(800, window.innerWidth * 0.7 )+ "px",
      data: '',
      direction: "rtl",
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      this.LoadAgent();
    });
  }


dateSearchFrom= new Date();
dateSearchTo= new Date();

  destinationList: Destination[] = [];
  totalAllSalary = 0;

  change(attn:Salary,index:number) {
    const pr = attn.agent.salary /(6*8);
    let totalHours = 0;
      attn.attendance.forEach((k: Attendance) => {
        if (k.workTime) {
          totalHours += k.workTime;
        }
      });
      attn.totalSalary = totalHours * pr + (attn.addtionMoney || 0);
      this.destinationList = [];
      this.totalAllSalary = 0;
      this.items.forEach((k: Salary) => { 
        const idx = this.destinationList.findIndex( (x) => x.title === k.agent.destinationTitle);
        if (idx < 0  ) {
          const dest = {} as Destination;
          dest.title = k.agent.destinationTitle;
          dest.total = k.totalSalary;
          this.destinationList.push(dest);
        } else {
          this.destinationList[idx].total += k.totalSalary;
        }
        this.totalAllSalary+= k.totalSalary;
      })
    }

  showAgentBalance(ed: Salary) {
    this.http
      .list('agents', "agent/ballnce/0/" + ed.agent.id + '/' + this.cmYear.id)
      .subscribe((e: any) => {
        ed.balance = e.denar;
      });
  }

  dateTags: any[] = [];
  items: Salary[] = [];

  LoadAgent() {
    this.showSpinner = true;
    this.http
      .post(this.appApi, "agent/attendes", {
        dtFrom: this.datePipe.transform(this.dateSearchFrom, 'yyyy-MM-dd'),
        'dtTo': this.datePipe.transform(this.dateSearchTo, 'yyyy-MM-dd'),
      } )
      .subscribe(
        (e: any) => {
          this.items = e;
          this.dateTags = [];

          const startD = new Date(this.dateSearchFrom  ); 
          const endD = new Date(this.dateSearchTo  );
       
          let currentDate = new Date(startD);  
          currentDate.setUTCHours(0, 0, 0, 0); 
       
          while (currentDate <= endD) {
            this.dateTags.push(this.datePipe.transform(currentDate, 'yyyy-MM-dd') );
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          }
         
          this.items.forEach((k: any) => {
            this.showAgentBalance(k);
            const startDate = new Date(this.dateSearchFrom  ); 
            const endDate = new Date(this.dateSearchTo  );
            let currentDate = new Date(startDate);  
            currentDate.setUTCHours(0, 0, 0, 0); 
            while (currentDate <= endDate) {
              const dtTag = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
              const idx = k.attendance.findIndex((x: Attendance) => x.dateAt === dtTag);
              if (idx < 0) {
                const atd = {} as Attendance;
                atd.dateAt = dtTag;
                atd.agent = k.agent.id;
                k.attendance.push(atd);
              }
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          });
          this.items.forEach((k: any, index) => {
            this.change(k, index);
           })
          this.showSpinner = false;
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
  }
 
  saveSlary() {
    this.showSpinner = true;
    this.http
      .post(this.appApi, "agent/save/salary", this.items)
      .subscribe(
        (e: any) => {
          this.showSpinner = false;
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
          this.selectedIndex = 0;
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
  }
 
  showInfo(row: Agent) {
    console.log(row);
  }
 
}
