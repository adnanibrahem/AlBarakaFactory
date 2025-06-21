import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { Page404Component } from "./authentication/page404/page404.component";
import { AuthGuard } from "./core/guard/auth.guard";
import { Role } from "./core/models/role";
import { AuthLayoutComponent } from "./layout/app-layout/auth-layout/auth-layout.component";
import { MainLayoutComponent } from "./layout/app-layout/main-layout/main-layout.component";

const routes: Routes = [
  {
    path: "",
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "/authentication/signin", pathMatch: "full" },
      {
        path: "pages",
        canActivate: [AuthGuard],
        data: {
          role: [Role.admin],
        },
        loadChildren: () =>
          import("./admin/admin.module").then((m) => m.AdminModule),
      },
      {
        path: "acc",
        canActivate: [AuthGuard],
        data: {
          role: [Role.accountant],
        },
        loadChildren: () =>
          import("./accountant/accountant.module").then(
            (m) => m.accountantModule
          ),
      },

      {
        path: "drw",
        canActivate: [AuthGuard],
        data: {
          role: [Role.drawing],
        },
        loadChildren: () =>
          import("./drawing/drawing.module").then((m) => m.DrawingModule),
      },

      {
        path: "cnc",
        canActivate: [AuthGuard],
        data: {
          role: [Role.cnc],
        },
        loadChildren: () => import("./cnc/cnc.module").then((m) => m.CNCModule),
      },

      {
        path: "plasma",
        canActivate: [AuthGuard],
        data: {
          role: [Role.plasma],
        },
        loadChildren: () =>
          import("./plasma/plasma.module").then((m) => m.PlasmaModule),
      },

      {
        path: "bending",
        canActivate: [AuthGuard],
        data: {
          role: [Role.bending],
        },
        loadChildren: () =>
          import("./bending/bending.module").then((m) => m.BendingModule),
      },

      {
        path: "cutting",
        canActivate: [AuthGuard],
        data: {
          role: [Role.cutting],
        },
        loadChildren: () =>
          import("./cutting/cutting.module").then((m) => m.CuttingModule),
      },
    ],
  },

  {
    path: "authentication",
    component: AuthLayoutComponent,
    loadChildren: () =>
      import("./authentication/authentication.module").then(
        (m) => m.AuthenticationModule
      ),
  },

  { path: "**", component: Page404Component },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor() {}
}
