import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('swapify_token'));
  userData = new BehaviorSubject<any>(this.getUserData()); // ✅ جبت البيانات من localStorage

  constructor(private http: HttpClient) {}

  private getUserData() {
    return {
      username: localStorage.getItem('username'),
      profileImg: localStorage.getItem('profileImg'),
      role: localStorage.getItem('role'),
    };
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // ✅ نحدث الحالة في BehaviorSubject
  setToken(token: string) {
    localStorage.setItem('swapify_token', token);
    this.loggedIn.next(true);
  }

  setUserData(user: any) {
    localStorage.setItem('username', user.username);
    localStorage.setItem('profileImg', user.profile_picture_url || 'assets/avatar.png');
    localStorage.setItem('role', user.role);
    this.userData.next(user);
  }

  clearToken() {
    localStorage.removeItem('swapify_token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImg');
    localStorage.removeItem('role');
    this.loggedIn.next(false);
    this.userData.next(null);
  }

  checkAuthStatus() {
    const tokenExists = !!localStorage.getItem('swapify_token');
    this.loggedIn.next(tokenExists);
  }
}
