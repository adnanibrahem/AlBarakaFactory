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
import { Agent, BalanceDetails, BoxTransaction } from "../accountant.model";
import { CommercialYear } from "app/admin/admin.model";

@Component({
  selector: "app-agents",
  templateUrl: "./agents.component.html",
  styleUrls: ["./agents.component.scss"],
})
export class AgentsComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<Agent> = new MatTableDataSource();
  dsBoxDet: MatTableDataSource<BalanceDetails> = new MatTableDataSource();

  @ViewChild("paginator") pagi!: MatPaginator;
  @ViewChild("pagDetails") pagDetails!: MatPaginator;
  group = "agent";
  isTablet = false;
  selectedIndex = 0;
  varAgent = {} as Agent;
  showSpinner = false;
  gFormGroup!: UntypedFormGroup;
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
  totalDenar = 0;
  totalDollar = 0;

  title = " العملاء ";

  radType=true;
  isloading = false;
  sendToPdf() {
    this.isloading = true;
    this.http
      .post(this.appApi, this.appApiURL + "pdf/all", {
        data: this.dataSource.filteredData,
        title: "قائمة اسماء العملاء",
        title1: "اسم العميل",
        totalDenar: this.totalDenar,
      })
      .subscribe(
        (e: any) => {
          window.open(e.url, "_blank");
          this.isloading = false;
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.isloading = false;
        }
      );
  }

  newFormGroup(): UntypedFormGroup {
    return this.fb.group({
      id: [],
      title: [],
      address: [],
      phoneNumber: [],
      limitDenar: [],
      limitDollar: [],
      initDenar: [],
      initDollar: [],
    });
  }

  cloneFormGroup(dt: Agent): UntypedFormGroup {
    return this.fb.group({
      id: [dt.id],
      title: [dt.title],
      address: [dt.address],
      branch: [dt.branch],
      userAuth: [dt.userAuth],
      phoneNumber: [dt.phoneNumber],
      initDenar: [dt.initDenar],
      initDollar: [dt.initDollar],
      initId: [dt.initId],
      limitDenar: [dt.limitDenar],
      limitDollar: [dt.limitDollar],
    });
  }
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
    this.gFormGroup = this.newFormGroup();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) this.LoadAgent();
    });
  }

  getAgentBalance(k: Agent) {
    this.http
      .list(
        this.appApi,
        this.appApiURL + "ballnce/0/" + k.id + "/" + this.cmYear.id
      )
      .subscribe((w: any) => {
        k.initDenar = w.initDenar;
        k.initDollar = w.initDollar;
        k.initId = w.initId;
        k.denar = w.denar;
        k.dollar = w.dollar;
        this.totalDenar += w.denar;
        this.totalDollar += w.dollar;
      });
  }

  LoadAgent(event?: any) {
    this.showSpinner = true;

    this.totalDenar = 0;
    this.totalDollar = 0;
    this.group = event ? (event.value ? "agent" : "worker") : "agent";


    this.http
      .list(this.appApi, this.appApiURL + "list/" + this.group)
      .subscribe(
        (e: any) => {
          this.dataSource = new MatTableDataSource(e);
          this.dataSource.data.forEach((k) => {
            this.getAgentBalance(k);
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
    this.caption = " تسجيل عميل جديد ";
    this.selectedIndex = 1;
  }
  editCall(ed: Agent) {
    this.gFormGroup = this.cloneFormGroup(ed);
    this.caption = " تعديل على بيانات عميل ";
    this.selectedIndex = 1;
  }
  onSubmit() {
    const dt = this.gFormGroup.getRawValue();
    dt.group = this.group;
    dt.vehicle = "";

    this.showSpinner = true;
    if (dt.id) {
      this.http
        .updateId(this.appApi, this.appApiURL + "edit", dt, dt.id)
        .subscribe(
          (e: any) => {
            const t = this.dataSource.data.findIndex((x) => x.id == e.id);
            this.dataSource.data[t] = Object.assign(e);
            this.getAgentBalance(e);
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
      this.http.create(this.appApi, this.appApiURL + "create", dt).subscribe(
        (e: any) => {
          this.showSpinner = false;
          this.dataSource.data.push(e);
          this.getAgentBalance(e);
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
  deleteItem(i: number, row: Agent) {
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
  showInfo(row: Agent) {
    console.log(row);
  }

  dipBoxDetaise = [
    "seq",
    "denar",
    "dollar",
    "amount",
    "inOut",
    "date",
    "toFrom",
    "comments",
  ];

  parssBoxTransaction(t: BoxTransaction): string {
    let txt = "";
    txt = " من ";
    if (t.fromAgent) txt += " عميل " + t.fromAgentTitle;
    txt += " الى ";
    if (t.toAgent) txt += " عميل " + t.toAgentTitle;
    else if (t.toBox) txt += "  الصندوق  ";
    else if (t.category) txt += " تبويب " + t.categoryTitle;
    return txt;
  }

  blnsDetals: BalanceDetails[] = [];
  currRowDetails: Agent = {} as Agent;

  detailsBalance(row: Agent) {
    this.caption = "تفاصيل رصيد العميل " + row.title;
    this.currRowDetails = row;
    this.showSpinner = true;
    this.http
      .list(
        this.appApi,
        this.appApiURL + "ballnce/1/" + row.id + "/" + this.cmYear.id
      )
      .subscribe(
        (w: any) => {
          row.details = w.details;
          this.blnsDetals = [];
          let bDenar = row.initDenar;
          let bDollar = row.initDollar;

          const dinit = {} as BalanceDetails;
          dinit.denar = bDenar;
          dinit.dollar = bDollar;

          dinit.comments = "بداية الرصيد";
          this.blnsDetals.push(dinit);
          w.details.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
          w.details.forEach((z: any) => {
            const d = {} as BalanceDetails;
            const t = z.d;
            d.comments = t.comments;
            if (z.type == "boxTransaction") {
              d.currency = t.currency;
              if (t.fromAgent) {
                d.inOut = "صادر";
                if (t.fromCurrency) {
                  d.amountDenar = t.fromAmount;
                  bDenar -= t.fromAmount;
                } else {
                  d.amountDollar = t.fromAmount;
                  bDollar -= t.fromAmount;
                }
              }
              if (t.toAgent) {
                d.inOut = "وارد";

                if (t.toCurrency) {
                  d.amountDenar = t.toAmount;
                  bDenar += t.toAmount;
                } else {
                  d.amountDollar = t.toAmount;
                  bDollar += t.toAmount;
                }
              }
              d.toFrom = this.parssBoxTransaction(t);
            }

            if (z.type == "manufacturingOrder") {
              d.items = t.items;
              d.inOut = "تصنيع";
              d.currency = t.currency;
              if (t.currency) {
                d.amountDenar = t.price;
                bDenar += t.price;
              } else {
                d.amountDollar = t.price;
                bDollar += t.price;
              }
            }

            if (z.type == "invoice") {
              d.inOut = "شراء مواد مخزنية";
              d.currency = t.currency;
              if (t.currency) {
                d.amountDenar = t.totalCost;
                bDenar -= t.totalCost;
              } else {
                d.amountDollar = t.totalCost;
                bDollar -= t.totalCost;
              }
            }

            d.denar = bDenar;
            d.dollar = bDollar;
            d.date = z.date;
            this.blnsDetals.push(d);
          });

          this.blnsDetals.reverse();
          this.dsBoxDet.data = this.blnsDetals;
          this.dsBoxDet.paginator = this.pagDetails;
          this.dsBoxDet._updateChangeSubscription();
          this.selectedIndex = 2;
          this.showSpinner = false;
        },
        () => {
          this.showSpinner = false;
        }
      );
  }



}
