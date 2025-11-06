import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminReport {
  private apiUrl = 'http://127.0.0.1:8000/api/reports';

  constructor(private http: HttpClient) {}

  getReports(): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get('http://127.0.0.1:8000/api/admin/reports', { headers });
  }

  removeOffer(reportId: number): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.patch(
      `http://127.0.0.1:8000/api/admin/reports/${reportId}/remove`,
      {},
      { headers }
    );
  }

  dismissReport(reportId: number): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.patch(
      `http://127.0.0.1:8000/api/admin/reports/${reportId}/dismiss`,
      {},
      { headers }
    );
  }
}
