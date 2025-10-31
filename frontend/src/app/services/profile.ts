import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('swapify_token'); // use the exact key
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  completeProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/complete`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  //Upload Profile Picture
  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return this.http.post(`${this.apiUrl}/upload/profile-picture`, formData, {
      headers: this.getAuthHeaders(),
    });
  }


  getProfile(email: string) {

    return this.http.get(`${this.apiUrl}/profile/${email}`, { headers: this.getAuthHeaders() });
  }
}
