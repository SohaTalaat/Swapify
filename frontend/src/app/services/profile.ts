import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private apiUrl = 'http://127.0.0.1:8000/api/profile/complete';
  constructor(private http: HttpClient) {}
  completeProfile(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  getProfile(email: string) {
    return this.http.get(`http://127.0.0.1:8000/api/profile/${email}`);
  }
}
