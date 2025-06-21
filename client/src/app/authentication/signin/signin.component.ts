/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { AuthService, Role, User } from "@core";
import { UnsubscribeOnDestroyAdapter } from "@shared";
@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = "";
  hide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.authService.setCurrentUserValue({} as User);
    this.authForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.error = "";
    if (this.authForm.invalid) {
      this.error = "Username and Password not valid !";
      return;
    } else {
      this.subs.sink = this.authService
        .login(this.f["username"].value, this.f["password"].value)
        .subscribe(
          (res: any) => {
            this.authService.getInfo().subscribe((e: any) => {
              const lUser = e[0] as User;

              const s = e[0].optionTime as string;
              lUser.isActive = false;
              let tUrl = "/pages/users";
              if (s.includes("3")) {
                lUser.isActive = true;
                lUser.role = Role.admin;
              } else if (s.includes("4")) {
                lUser.role = Role.drawing;
                tUrl = "/drw/design";
              } else if (s.includes("2")) {
                lUser.role = Role.accountant;
                tUrl = "/acc/agents";
              } else if (s.includes("1")) {
                lUser.role = Role.cutting;
                tUrl = "/cutting/page";
              } else if (s.includes("0")) {
                lUser.role = Role.bending;
                tUrl = "/bending/page";
              } else if (s.includes("5")) {
                lUser.role = Role.cnc;
                tUrl = "/cnc/page";
              } else if (s.includes("6")) {
                lUser.role = Role.plasma;
                tUrl = "/plasma/page";
              } else {
                localStorage.clear();
                sessionStorage.clear();
                this.router.navigate(["/authentication/signin"]);
              }

              lUser.token = res.token;
              this.authService.setCurrentUserValue(lUser);
              this.router.navigate([tUrl]);
            });
          },
          (error) => {
            this.error = error;
            this.submitted = false;
            this.loading = false;
          }
        );
    }
  }
}
