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
    const storedUser = localStorage.getItem('swapify_user');
    const email = localStorage.getItem('email');
    const profileImg = localStorage.getItem('profileImg');
    const role = localStorage.getItem('role');

    if (token) {
      this.loggedIn.next(true);

      if (storedUser) {
        // ✅ استرجاع المستخدم كامل من localStorage
        const user = JSON.parse(storedUser);
        this.userData.next(user);
      } else {
        // ✅ fallback بسيط لو مفيش swapify_user
        this.userData.next({
          email,
          profile_picture_url: profileImg || 'assets/avatar.png',
          role,
        });
      }
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
    localStorage.setItem('swapify_user', JSON.stringify(user));

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
    localStorage.removeItem('swapify_user');

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
  updateUserData(user: any) {
    this.userData.next(user);
    if (user.profile_picture_url) {
      localStorage.setItem('profileImg', user.profile_picture_url);
    }
    if (user.username) {
      localStorage.setItem('username', user.username);
    }
  }
}
