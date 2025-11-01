import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://127.0.0.1:8000/api';

  // ✅ الحالة العامة
  public loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('swapify_token'));
  public userData = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.restoreUserData(); // ✅ استرجاع البيانات عند بداية الخدمة
  }

  // ✅ استرجاع البيانات من localStorage (تُستدعى مرة واحدة عند تحميل التطبيق)
  restoreUserData() {
    const token = localStorage.getItem('swapify_token');
    const username = localStorage.getItem('username');
    const profileImg = localStorage.getItem('profileImg');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');

    if (token) {
      this.loggedIn.next(true);
      this.userData.next({
        username,
        profile_picture_url: profileImg || 'assets/avatar.png',
        role,
        email,
      });
    } else {
      this.loggedIn.next(false);
      this.userData.next(null);
    }
  }

  // ✅ API Calls
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
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

  // ✅ إدارة التوكن
  setToken(token: string) {
    localStorage.setItem('swapify_token', token);
    this.loggedIn.next(true);
  }

  // ✅ تحديث بيانات المستخدم
  setUserData(user: any) {
    localStorage.setItem('username', user.username);
    localStorage.setItem('profileImg', user.profile_picture_url || 'assets/avatar.png');
    localStorage.setItem('role', user.role);
    if (user.email) localStorage.setItem('email', user.email);
    this.userData.next(user);
  }

  // ✅ تسجيل خروج
  clearToken() {
    localStorage.removeItem('swapify_token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImg');
    localStorage.removeItem('role');
    this.loggedIn.next(false);
    this.userData.next(null);
  }

  // ✅ التحقق من الحالة الحالية
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  checkAuthStatus() {
    const tokenExists = !!localStorage.getItem('swapify_token');
    this.loggedIn.next(tokenExists);
  }
}
