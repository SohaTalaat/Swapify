import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Review {
  private baseUrl = 'http://127.0.0.1:8000/api/reviews'; // API endpoint

  constructor(private http: HttpClient) {}

  /** Create a new review */
  createReview(data: any): Observable<any> {
    const token = localStorage.getItem('swapify_token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(this.baseUrl, data, { headers });
  }

  /** Get all reviews of the authenticated user */
  getUserReviews(): Observable<any> {
    const token = localStorage.getItem('swapify_token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(this.baseUrl, { headers });
  }

  /** Check if the user has already reviewed a specific barter */
  hasReviewed(barterId: number): Observable<{ hasReviewed: boolean }> {
    const token = localStorage.getItem('swapify_token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<{ hasReviewed: boolean }>(`${this.baseUrl}/has-reviewed/${barterId}`, {
      headers,
    });
  }
}
