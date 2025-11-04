import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUpload {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('swapify_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /** ✅ رفع صورة العرض (Listing) إلى Cloudinary */
  uploadListingImage(listingId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('listing_id', listingId.toString());

    return this.http.post(`${this.apiUrl}/upload/listing-image`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  /** رفع صورة البروفايل */
  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    return this.http.post(`${this.apiUrl}/upload/profile-picture`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  /** رفع التحقق بالهوية */
  uploadIdVerification(idFile: File, selfie: File): Observable<any> {
    const formData = new FormData();
    formData.append('id_document', idFile);
    formData.append('selfie', selfie);

    return this.http.post(`${this.apiUrl}/upload/id-verification`, formData, {
      headers: this.getAuthHeaders(),
    });
  }
}
