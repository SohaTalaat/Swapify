import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Offer {
  private apiUrl = 'http://127.0.0.1:8000/api/listings';

  constructor(private http: HttpClient) {}

  /** ✅ توليد الـ Headers */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('swapify_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }

  /** ✅ جلب جميع العروض */
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  /** ✅ إنشاء عرض جديد مع صور */
  create(data: any): Observable<any> {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key === 'images') {
        data.images.forEach((file: File) => {
          formData.append('images[]', file);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  /** ✅ جلب عرض واحد */
  getOne(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /** ✅ تحديث عرض */
  update(id: number, data: any, images: File[]): Observable<any> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) formData.append(key, data[key]);
    });

    images.forEach((img) => formData.append('images[]', img));

    return this.http.post(`${this.apiUrl}/${id}?_method=PUT`, formData, {
      headers: this.getHeaders(),
    });
  }

  /** ✅ جلب التصنيفات */
  getCategories(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/api/categories', {
      headers: this.getHeaders(),
    });
  }

  /** ✅ حذف عرض */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /** ✅ جلب العروض الخاصة بالمستخدم */
  getMyOffers(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/api/my-offers', {
      headers: this.getHeaders(),
    });
  }

  /** ✅ حذف عرض للمستخدم */
  deleteOffer(id: number): Observable<any> {
    return this.http.delete(`http://127.0.0.1:8000/api/listings/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
