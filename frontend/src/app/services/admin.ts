import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('swapify_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }

  // Overview data

  getOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/overview`, { headers: this.getHeaders() });
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() });
  }

  banUser(userId: number, reason?: string): Observable<any> {
    const body: any = {};
    if (reason !== undefined) {
      body.reason = reason;
    }

    return this.http.patch(`${this.apiUrl}/admin/users/${userId}/ban`, body, {
      headers: this.getHeaders(),
    });
  }

  activateUser(userId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/activate`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Offers and Listings
  getListings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/listings`, { headers: this.getHeaders() });
  }

  toggleListingStatus(listingId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/listings/${listingId}/toggle`,
      {},
      { headers: this.getHeaders() }
    );
  }

  approveListing(listingId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin/listings/${listingId}/approve`,
      {},
      { headers: this.getHeaders() }
    );
  }

  rejectListing(listingId: number, rejectionReason: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin/listings/${listingId}/reject`,
      { rejection_reason: rejectionReason },
      { headers: this.getHeaders() }
    );
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
    return this.http.get(`${this.apiUrl}/admin/shipments`, { headers: this.getHeaders() });
  }

  updateShipmentStatus(shipmentId: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/shipments/${shipmentId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  uploadShipmentPhoto(
    shipmentId: number,
    file: File,
    type: 'pickup' | 'delivery'
  ): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('type', type);

    return this.http.post(`${this.apiUrl}/admin/shipments/${shipmentId}/upload-photo`, formData, {
      headers: this.getHeaders(),
    });
  }
  getBarterStats() {
    return this.http.get(`${this.apiUrl}/admin/barter-stats`, { headers: this.getHeaders() });
  }

  getCancelledBarters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/barters/cancelled`, {
      headers: this.getHeaders(),
    });
  }

  // Disputes
  getDisputes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/disputes`, {
      headers: this.getHeaders(),
    });
  }

  resolveDispute(disputeId: number, resolutionNotes: string, status: string = 'resolved'): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/disputes/${disputeId}/resolve`,
      { resolution_notes: resolutionNotes, status },
      { headers: this.getHeaders() }
    );
  }
}
