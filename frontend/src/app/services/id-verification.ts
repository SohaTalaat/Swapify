import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IDVerification {
  id?: number;
  user_id?: number;
  id_document_url: string;
  selfie_url: string;
  status?: string;
  rejection_reason?: string;
  verified_by_admin_id?: number | null;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IdVerification {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('swapify_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /** 📤 إرسال ملفات التحقق */
  submitVerification(idDocument: File, selfie: File): Observable<any> {
    const formData = new FormData();
    formData.append('id_document', idDocument);
    formData.append('selfie', selfie);

    return this.http.post(`${this.apiUrl}/id-verification`, formData, {
      headers: this.getHeaders(),
    });
  }

  /** 🔍 عرض الحالة الحالية */
  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/id-verification`, {
      headers: this.getHeaders(),
    });
  }

  // ================== ADMIN ==================
  // service
  getAllVerifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/id-verification`, {
      headers: this.getHeaders(),
    });
  }

  approve(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin/id-verification/${id}/approve`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  reject(id: number, reason: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin/id-verification/${id}/reject`,
      { rejection_reason: reason },
      { headers: this.getHeaders() }
    );
  }
}
