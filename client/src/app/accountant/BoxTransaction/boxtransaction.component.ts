/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm.component";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { UnsubscribeOnDestroyAdapter } from "@shared/UnsubscribeOnDestroyAdapter";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { MyHTTP } from "@core/service/myHttp.service";

import { AuthService, User } from "@core";

import { from, Subject } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import {
  Agent,
  BalanceDetails,
  BoxBalance,
  BoxTransaction,
  Category,
  Destination,
  Documents,
} from "../accountant.model";
import { CommercialYear } from "app/admin/admin.model";

@Component({
  selector: "app-boxtransaction",
  templateUrl: "./boxtransaction.component.html",
  styleUrls: ["./boxtransaction.component.scss"],
})
export class BoxTransactionComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<BoxTransaction> = new MatTableDataSource();
  @ViewChild("paginator") pagi!: MatPaginator;
  @ViewChild("pagBoxDetails") pagBoxDetails!: MatPaginator;

  isTablet = false;
  selectedIndex = 0;
  varBTrx = {} as BoxTransaction;
  showSpinner = false;
  curUser: User = {} as User;

  boxBalance = {} as BoxBalance;

  caption = "";
  displayedColumns = [
    "seq",
    "fromText",
    "toText",
    "fromAmount",
    "toAmount",
    "transactionDate",
    "comments",
    // "userTitle",
    "actions",
  ];
  title = " الحسابات ";

  fromSelect = "";
  toSelect = "";

  /////////

  agentList: Agent[] = [];
  LoadAgentList() {
    this.http.list("agents", "agent/list/agent").subscribe((e: any) => {
      this.agentList = e;
    });
  }

  workerList: Agent[] = [];
  LoadWorkerList() {
    this.http.list("agents", "agent/list/worker").subscribe((e: any) => {
      this.workerList = e;
    });
  }
  ////////////////////////////////////////

  categoryList: Category[] = [];
  LoadcategoryList() {
    this.http.list("box", "category/list").subscribe((e: any) => {
      this.categoryList = e;
    });
  }

  appApi = "box";
  appApiURL = "boxTransaction/";
  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    protected sanitizer: DomSanitizer,
    private auth: AuthService,
    private datePipe: DatePipe
  ) {
    super();
  }
  cmYear: CommercialYear = {} as CommercialYear;

  dipBoxDetaise = [
    "seq",
    "denar",
    "dollar",
    "inOut",
    "amount",
    "date",
    "toFrom",
    "comments",
  ];

  boxDetals: BalanceDetails[] = [];
  dsBoxDet: MatTableDataSource<BalanceDetails> = new MatTableDataSource();
  parssBoxTransaction(t: BoxTransaction): string {
    let txt = "";

    if (t.toBox) {
      txt = "  ";
      if (t.fromAgent) txt += "" + t.fromAgentTitle;
    }
    if (t.fromBox) {
      txt = "  ";
      if (t.toAgent) txt += "    " + t.toAgentTitle;
      else if (t.category) txt += t.categoryTitle;
    }
    return txt;
  }

  initId = undefined;
  initDenar = 0;
  initDollar = 0;
  moreDetailse() {
    this.caption = "تفاصيل رصيد الصندوق";
    this.showSpinner = true;
    this.http.list(this.appApi, "box/ballnce/1/" + this.cmYear.id).subscribe(
      (e: any) => {
        this.boxBalance = e;
        this.initId = e.initId;
        this.initDenar = e.initDenar;
        this.initDollar = e.initDollar;
        const dint = {} as BalanceDetails;
        dint.comments = "بداية الرصيد";
        dint.denar = e.initDenar;
        dint.dollar = e.initDollar;
        let bDenar = e.initDenar;
        let bDollar = e.initDollar;

        this.boxBalance.details.sort((a, b) =>
          a.transactionDate < b.transactionDate ? -1 : 1
        );
        this.boxDetals = [];
        this.boxDetals.push(dint);
        this.boxBalance.details.forEach((t) => {
          const d = {} as BalanceDetails;
          if (t.fromBox) {
            d.inOut = "صادر";
            if (t.fromCurrency) {
              d.amountDenar = t.fromAmount;
              bDenar -= d.amountDenar;
            } else {
              d.amountDollar = t.fromAmount;
              bDollar -= d.amountDollar;
            }
          }
          if (t.toBox) {
            d.inOut = "وارد";
            if (t.toCurrency) {
              d.amountDenar = t.toAmount;
              bDenar += d.amountDenar;
            } else {
              d.amountDollar = t.toAmount;
              bDollar += d.amountDollar;
            }
          }
          d.denar = bDenar;
          d.dollar = bDollar;
          d.toFrom = this.parssBoxTransaction(t);
          d.date = t.transactionDate;
          d.comments = t.comments;
          this.boxDetals.push(d);
        });

        this.boxDetals.reverse();
        this.dsBoxDet.data = this.boxDetals;
        this.dsBoxDet.paginator = this.pagBoxDetails;
        this.dsBoxDet._updateChangeSubscription();

        this.selectedIndex = 2;
        this.showSpinner = false;
      },
      () => {
        this.showSpinner = false;
      }
    );
  }

  initBalanceBox() {
    this.caption = "تعديل بداية الرصيد";
    this.selectedIndex = 4;
  }

  onSaveChange() {
    this.http
      .post(this.appApi, "box/initballnce", {
        initId: this.initId,
        initDenar: this.initDenar,
      })
      .subscribe(
        () => {
          this.loadBoxBallance();
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
        }
      );
  }

  destinationList: Destination[] = [];
  LoadDestinationList() {
    this.http.list("agents", "destination/list").subscribe((e: any) => {
      this.destinationList = e;
    });
  }

  ngOnInit(): void {
    this.LoadAgentList();
    this.LoadWorkerList();
    this.LoadcategoryList();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadBoxTransaction();
        this.loadBoxBallance();
        this.LoadDestinationList();
        this.curUser = this.auth.currentUserValue;
      }
    });
  }

  loadBoxBallance() {
    this.showSpinner = true;
    this.http.list(this.appApi, "box/ballnce/0/" + this.cmYear.id).subscribe(
      (e: any) => {
        this.showSpinner = false;
        this.boxBalance = e;
        this.initId = e.initId;
        this.initDenar = e.initDenar;
        this.initDollar = e.initDollar;
      },
      () => {
        this.showSpinner = false;
      }
    );
  }

  showFromBalance = false;
  showFromBalanceSpinner = false;
  fromDenar = 0;
  fromDollar = 0;

  showToBalance = false;
  showToBalanceSpinner = false;
  toDenar = 0;
  toDollar = 0;

  showAgentBalance(agentId: number, from = false, to = false) {
    if (from) {
      this.showFromBalanceSpinner = true;
      this.fromDenar = 0;
      this.fromDollar = 0;
    }
    this.http
      .list('agents', "agent/ballnce/0/" + agentId + '/' + this.cmYear.id)
      .subscribe((e: any) => {
        if (from) {
          this.showFromBalanceSpinner = false;
          this.fromDenar = e.denar;
          this.fromDollar = e.dollar;
          this.showFromBalanceSpinner = false;
        } else if (to) {
          this.showToBalanceSpinner = false;
          this.toDenar = e.denar;
          this.toDollar = e.dollar;
        }
      }, () => {
        if (from) {
          this.showFromBalanceSpinner = false;
        } else if (to) {
          this.showToBalanceSpinner = false;
        }
        this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
      });
  }

  getFromToTitle(k: BoxTransaction) {
    if (k.fromAgent) k.fromText = k.fromAgentTitle;
    else if (k.fromBox) k.fromText = " الصندوق";
    else if (k.fromOther) k.fromText = " اخرى";

    if (k.toAgent) k.toText = k.toAgentTitle;
    else if (k.toBox) k.toText = " الصندوق";
    else if (k.toOther) k.toText = " اخرى ";
    else if (k.category) k.toText = k.categoryTitle;
  }

  showAdvanceSearch = false;
  onAdvaceSearch() {
    this.showAdvanceSearch = !this.showAdvanceSearch;
    if (!this.showAdvanceSearch) {
      this.LoadBoxTransaction();
    }
  }

  dateSearchTo = "";
  dateSearchFrom = "";
  doSearch() {
    if (this.agentFilter.toString() == "") this.agentFilter = -1;
    this.LoadBoxTransaction({
      dtFrom: this.datePipe.transform(this.dateSearchFrom, "yyyy-MM-dd"),
      dtTo: this.datePipe.transform(this.dateSearchTo, "yyyy-MM-dd"),
      radOption: this.radOption,
      agentFilter: this.agentFilter,
    });
  }

  LoadBoxTransaction(jsn: any = {}) {
    this.showSpinner = true;
    this.http.post(this.appApi, this.appApiURL + "list", jsn).subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.data.forEach((k) => {
          this.getFromToTitle(k);
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

  addNew(isNew = true) {
    this.caption = " اضافة حركة حسابات جديدة ";

    if (isNew) {
      this.varBTrx = {} as BoxTransaction;
      this.fromSelect = "fromBox";
      this.toSelect = "toBox";
      this.raidChangeTo("toBox");
      this.raidChangeFrom("fromBox");
      this.varBTrx.fromCurrency = true;
      this.varBTrx.toCurrency = true;
      this.varBTrx.transactionDate = new Date();
    }

    this.varBTrx.comments = "";

    this.varBTrx.documents = [];

    this.selectedIndex = 1;
  }

  editCall(ed: BoxTransaction) {
    this.varBTrx = ed;
    this.caption = " تعديل بيانات حركة حسابات ";

    this.varBTrx.fromAmountComma = ed.fromAmount;
    this.varBTrx.toAmountComma = ed.toAmount;
    this.selectedIndex = 1;
    if (
      ed.fromAgent &&
      this.agentList.findIndex((x) => x.id === ed.fromAgent) > -1
    )
      this.fromSelect = "fromAgent";
    else if (ed.fromBox) this.fromSelect = "fromBox";
    else if (ed.fromOther) this.fromSelect = "fromOther";

    this.raidChangeFrom(this.fromSelect);

    if (ed.toAgent && this.agentList.findIndex((x) => x.id === ed.toAgent) > -1)
      this.toSelect = "toAgent";
    else if (ed.toBox) this.toSelect = "toBox";
    else if (ed.toOther) this.toSelect = "toOther";
    else if (ed.category) this.toSelect = "category";

    this.raidChangeTo(this.toSelect);
  }

  isValid(): boolean {
    if (
      this.fromSelect == "fromAgent" &&
      this.varBTrx?.fromAgent?.toString() == ""
    )
      return true;
    
    if (this.fromSelect == "fromBox" && this.toSelect == "toBox")
      return true;
    if (this.fromSelect == "fromOther" && this.toSelect == "toOther")
      return true;

    if (this.toSelect == "toAgent" && this.varBTrx?.toAgent?.toString() == "")
      return true;

    if (this.toSelect == "category" && this.varBTrx?.category?.toString() == "")
      return true;

    return false;
  }
  radOption = 0;
  agentFilter = -1;

  agentFilterFN($event: any) {
    this.agentFilter = $event;
    if ($event) this.agentFilter = $event.id;
  }

  onSubmit() {
    if (!this.varBTrx.category)
      this.varBTrx.destination = null;

    const dt = this.varBTrx;
    this.showSpinner = true;

    dt.transactionDate = this.datePipe.transform(
      dt.transactionDate,
      "yyyy-MM-dd"
    );

    if (dt.id) {
      this.http
        .updateId(this.appApi, this.appApiURL + "edit", dt, dt.id)
        .subscribe(
          (e: any) => {
            const t = this.dataSource.data.findIndex((x) => x.id == e.id);
            this.getFromToTitle(e);
            this.uploadNewPictures(this.varBTrx);
            this.dataSource.data[t] = Object.assign(e);
            this.dataSource._updateChangeSubscription();
            this.showSpinner = false;
            this.loadBoxBallance();
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
          this.dataSource.data.unshift(e);
          this.uploadNewPictures(this.varBTrx);
          this.getFromToTitle(e);
          this.loadBoxBallance();
          this.dataSource._updateChangeSubscription();
          this.http.showNotification("snackbar-success", "تم الخزن بنجاح");
          // this.selectedIndex = 0;
          this.addNew(true);
        },
        () => {
          this.http.showNotification("snackbar-danger", "حدثت مشكلة ");
          this.showSpinner = false;
        }
      );
    }
  }
  deleteItem(i: number, row: BoxTransaction) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: "200px",
      width: "300px",
      data: { txt: "هل انت متأكد من حذف  ؟", title: "" },
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
              this.loadBoxBallance();
              this.dataSource._updateChangeSubscription();
              this.http.showNotification("snackbar-success", "تم الحدف بنجاح");
            }
          });
      }
    });
  }
  showInfo(row: BoxTransaction) {
    console.log(row);
  }
  toAgentEvent: Subject<boolean> = new Subject<boolean>();
  fromAgentEvent: Subject<boolean> = new Subject<boolean>();
  fromWorkerEvent: Subject<boolean> = new Subject<boolean>();
  toWorkerEvent: Subject<boolean> = new Subject<boolean>();
  categoryEvent: Subject<boolean> = new Subject<boolean>();
  raidChangeTo(ev: string) {
    if (!ev) return;
    const v = ev;
    this.toAgentEvent.next(v === "toAgent");
    this.toWorkerEvent.next(v === "toWorker");
    this.categoryEvent.next(v === "category");
    this.varBTrx.toBox = v === "toBox";
    this.varBTrx.toOther = v === "toOther";
  }

  raidChangeFrom(ev: string) {
    if (!ev) return;
    const v = ev;
    this.fromAgentEvent.next(v === "fromAgent");
    this.fromWorkerEvent.next(v === "fromWorker");
    this.varBTrx.fromBox = v === "fromBox";
    this.varBTrx.fromOther = v === "fromOther";
    if (this.fromSelect != "fromAgent" && this.toSelect == "discount") {
      this.toSelect = "toBox";
      this.varBTrx.fromBox = v === "fromBox";
    }
  }

  categoryFN($event: any) {
    this.varBTrx.category = $event;
    if ($event) this.varBTrx.category = $event.id;
  }

  fromAgentFN($event: any) {
    this.varBTrx.fromAgent = $event;
    if ($event) this.varBTrx.fromAgent = $event.id;
    if (this.varBTrx.fromAgent) {
      this.showFromBalance=true
      this.showAgentBalance(this.varBTrx.fromAgent,true)
    } else {
      this.showFromBalance=false
    }
  }
 

  toAgentFN($event: any) {
    this.varBTrx.toAgent = $event;
    if ($event) this.varBTrx.toAgent = $event.id;

    if (this.varBTrx.toAgent) {
      this.showToBalance=true
      this.showAgentBalance(this.varBTrx.toAgent,false,true)
    } else {
      this.showToBalance=false
    }  
  }

  //  ---------------- pictures

  removeResetPicture(i: number) {
    if (this.varBTrx.documents[i].id) {
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
            .delete(this.appApi, "documents/rud", this.varBTrx.documents[i])
            .subscribe(() => {
              this.varBTrx.documents.splice(i, 1);
            });
        }
      });
    } else this.varBTrx.documents.splice(i, 1);
  }

  selectedImage = new UntypedFormControl();

  showImagePreview(file: File) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      const showPictureFile = new UntypedFormControl();
      showPictureFile.setValue(
        this.sanitizer.bypassSecurityTrustUrl(reader.result as string)
      );
      const doc = {} as Documents;
      doc.obj = showPictureFile;
      doc.objFile = file;
      this.varBTrx.documents.push(doc);
    };
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

    this.selectedImage!.setValue(fileList[0]);
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
  uploadNewPictures(pb: BoxTransaction) {
    pb.documents.forEach((k) => {
      if (!k.id) {
        const fd = new FormData();
        fd.append("boxTransaction", pb.id.toString());
        if (k.objFile) fd.append("img", k.objFile);
        else {
          const file = this.DataURIToBlob(
            k.obj.value.changingThisBreaksApplicationSecurity
          );
          fd.append("img", file, "image.jpg");
        }
        this.showSpinner = true;
        this.http
          .create(this.appApi, "documents/create", fd)
          .subscribe((e: any) => {
            this.showSpinner = false;
            const pbk = this.dataSource.data.find((x) => x.id == pb.id);
            if (pbk) {
              e.obj = k.obj;
              pbk.documents.push(e);
            }
          });
      }
    });
  }
  imgClick(x: any) {
    window.open(x.img);
  }
  //  ------------End pictures

  storDenar = 0;
  storDollar = 0;
  storspinner = true;

  agentDenar = 0;
  agentDollar = 0;
  agentpinner = true;

  customerDenar = 0;
  customerDollar = 0;
  customerpinner = true;

  otherAccDenar = 0;
  otherAccDollar = 0;
  otherAccpinner = true;

  mBranchDenar = 0;
  mBranchDollar = 0;
  mBranchpinner = true;

  totalDenar = 0;
  totalDollar = 0;
  updateTotal() {
    this.totalDenar =
      this.mBranchDenar +
      this.otherAccDenar +
      this.customerDenar +
      this.storDenar +
      this.agentDenar;
    this.totalDollar =
      this.mBranchDollar +
      this.otherAccDollar +
      this.customerDollar +
      this.storDollar +
      this.agentDollar;
  }

  dtFrom = "";
  dtTo = "";

  theProfits: any;
  denarProfits = 0;
  dollarProfits = 0;
  profitSpinner = false;

  calculateProfit() {
    this.profitSpinner = true;
    this.http
      .post("agents", "profit", {
        dtFrom: this.datePipe.transform(this.dtFrom, "yyyy-MM-dd"),
        dtTo: this.datePipe.transform(this.dtTo, "yyyy-MM-dd"),
      })
      .subscribe((e: any) => {
        this.theProfits = e;
        e.fatoraItemsList.sort((a: any, b: any) =>
          a.materialTitle < b.materialTitle ? -1 : 1
        );

        this.denarProfits = e.salesDenar - (e.expencessDenar + e.costDenar);
        this.dollarProfits = 0 - e.expencessDollar;
        this.profitSpinner = false;
      });
  }
}
