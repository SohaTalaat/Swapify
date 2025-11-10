import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Report {
  private apiUrl = 'http://127.0.0.1:8000/api/reports';

  constructor(private http: HttpClient) {}

  submitReport(listingId: number, reason: string): Observable<any> {
    const token = localStorage.getItem('swapify_token'); // ✅ احصل على التوكن
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.post(this.apiUrl, { listing_id: listingId, reason }, { headers });
  }
}
