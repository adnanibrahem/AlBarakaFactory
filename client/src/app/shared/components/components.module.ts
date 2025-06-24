import { NgModule } from "@angular/core";
import { FileUploadComponent } from "./file-upload/file-upload.component";
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";
import { SharedModule } from "../shared.module";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm.component";
import { WebcamModule } from "ngx-webcam";
import { WebcamDialogComponent } from "./webcam-dialog/webcam-dialog.component";
import { ShowOnlyDialogComponent } from "./show-only-dialog/show-only-dialog.component";

import { MyAutoCompleteComponent } from "./myAutoComplete/myAutoComplete.component";
import { ChipsAutocompleteComponent } from "./chipsAutocomplete/chipsAutocomplete.component";
import { BarcodeDialogComponent } from "./barcodeDialog/barcode-dialog.component";
import { ZXingScannerModule } from "@zxing/ngx-scanner";
import { NumberCommaDirective } from "./number-comma.directive";
import { ShowFatoraItemsDialogComponent } from "./show-fatora-items/show-fatora-items.component";
import { BalanceMigrationDialogComponent } from "./balance-migration/balance-migration-dialog.component";
import { WithdrawalDestinationsDialogComponent } from "./WithdrawalDestinations/withdrawal-destinations.component";
import { WokersDialogComponent } from "./Workers/workers.component";

@NgModule({
  declarations: [
    FileUploadComponent,
    BreadcrumbComponent,
    ConfirmDialogComponent,
    WebcamDialogComponent,
    ShowOnlyDialogComponent,
    ShowFatoraItemsDialogComponent,
    MyAutoCompleteComponent,
    ChipsAutocompleteComponent,
    NumberCommaDirective,
    BarcodeDialogComponent,
    BalanceMigrationDialogComponent,
    WithdrawalDestinationsDialogComponent,
    WokersDialogComponent
  ],
  imports: [SharedModule, WebcamModule, ZXingScannerModule],
  exports: [
    FileUploadComponent,
    BreadcrumbComponent,
    WebcamDialogComponent,
    ConfirmDialogComponent,
    ShowOnlyDialogComponent,
    BarcodeDialogComponent,
    MyAutoCompleteComponent,
    ChipsAutocompleteComponent,
    NumberCommaDirective,
    BalanceMigrationDialogComponent,
    WithdrawalDestinationsDialogComponent,
    WokersDialogComponent
  ],
})
export class ComponentsModule {}
