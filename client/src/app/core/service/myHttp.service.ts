/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";

import { environment } from "environments/environment";

@Injectable({
  providedIn: "root",
})
export class MyHTTP {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    // this.apiUrl = document.location.origin + "/api/";
  }
  sacnFromOptical(app: string, path: string) {
    return this.http.get(`${app}/${path}/`);
  }

  list(app: string, path: string) {
    return this.http.get(`${this.apiUrl}${app}/${path}/`);
  }

  post(app: string, path: string, data: any) {
    return this.http.post(`${this.apiUrl}${app}/${path}/`, data);
  }

  postblob(app: string, path: string, data: any) {
    return this.http.post(`${this.apiUrl}${app}/${path}/`, data, { responseType: "blob" });
  }
  
  create(app: string, path: string, data: any) {
    return this.http.post(`${this.apiUrl}${app}/${path}/`, data);
  }

  update(app: string, path: string, data: any) {
    let id = data.id;
    if (!id) id = data.get("id");
    return this.http.put(
      `${this.apiUrl}${app}/${path}/` + id + "/",
      data
    );
  }

  // listPostBookPagination(
  //   number: number,
  //   txtSearch: any
  // ): Observable<PaginationData<T>> {
  //   return this.http.post<PaginationData<T>>(
  //     `${environment.apiUrl}postBooks/postBooks/list/?page=${number + 1}`,
  //     txtSearch
  //   );
  // }

  updateId(app: string, path: string, data: any, id: number) {
    return this.http.put(
      `${this.apiUrl}${app}/${path}/` + id + "/",
      data
    );
  }

  delete(app: string, path: string, data: any) {
    return this.http.delete(
      `${this.apiUrl}${app}/${path}/` + data.id + "/"
    );
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition = "top",
    placementAlign: MatSnackBarHorizontalPosition = "left"
  ) {
    this.snackBar.open(text, "", {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: ["my-snackbar", colorName],
    });
  }
}
