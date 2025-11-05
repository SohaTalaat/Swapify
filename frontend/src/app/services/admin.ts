
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({

  providedIn: 'root'

})

export class AdminService {

 private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  // Overview data

  getOverview(): Observable<any> {

    return this.http.get(`${this.apiUrl}/overview`);

  }

  // Users

  getUsers(): Observable<any> {

    return this.http.get(`${this.apiUrl}/users`);

  }

  banUser(userId: number): Observable<any> {

    return this.http.patch(`${this.apiUrl}/users/${userId}/ban`, {});

  }

  activateUser(userId: number): Observable<any> {

    return this.http.patch(`${this.apiUrl}/users/${userId}/activate`, {});

  }

  // Offers

  getListings(): Observable<any> {

    return this.http.get(`${this.apiUrl}/listings`);

  }

  // Content Reports

  getReports(): Observable<any> {

    return this.http.get(`${this.apiUrl}/reports`);

  }

  removeReport(reportId: number): Observable<any> {

    return this.http.patch(`${this.apiUrl}/reports/${reportId}/remove`, {});

  }

  dismissReport(reportId: number): Observable<any> {

    return this.http.patch(`${this.apiUrl}/reports/${reportId}/dismiss`, {});

  }

  


// Verification

  approveVerification(userId: number): Observable<any> {

    return this.http.patch(`${this.apiUrl}/verifications/${userId}/approve`, {});

  }

  rejectVerification(userId: number): Observable<any> {

    return this.http.patch(`${this.apiUrl}/verifications/${userId}/reject`, {});

  }

  // Shipping

  getShipments(): Observable<any> {

    return this.http.get(`${this.apiUrl}/shipments`);

  }

}

