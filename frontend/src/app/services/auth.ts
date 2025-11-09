import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EchoService } from './echo'


@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://127.0.0.1:8000/api';

  public loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('swapify_token'));
  public userData = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private echoService: EchoService) {
    this.restoreUserData();
  }

  /**  Restore user info from localStorage on page load */
  restoreUserData() {
    const token = localStorage.getItem('swapify_token');
    const storedUser = localStorage.getItem('swapify_user');
    const email = localStorage.getItem('email');
    const profileImg = localStorage.getItem('profileImg');
    const role = localStorage.getItem('role');

    if (token) {
      this.loggedIn.next(true);

      // 🧠 Reconnect Echo if token exists
      this.echoService.initEcho(token);

      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.userData.next(user);
      } else {
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

  /** ✅ Register new user */
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /** ✅ Login user and initialize Echo connection */
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        // Save token
        this.setToken(res.token);
        // Save user data
        this.setUserData(res.user);

        // 🔄 Reinitialize Echo with new token
        this.echoService.initEcho(res.token);

        console.log('🔑 User logged in and Echo connected');
      })
    );
  }

  /** ✅ Logout and disconnect Echo */
  logout(): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .pipe(
        tap(() => {
          this.clearToken();
          // 🔌 Disconnect Echo
          this.echoService.disconnect();
          console.log('👋 User logged out and Echo disconnected');
        })
      );
  }

  /** ✅ Store auth token */
  setToken(token: string) {
    localStorage.setItem('swapify_token', token);
    this.loggedIn.next(true);
  }

  /** ✅ Save user data */
  setUserData(user: any) {
    localStorage.setItem('username', user.username);
    localStorage.setItem('profileImg', user.profile_picture_url || 'assets/avatar.png');
    localStorage.setItem('role', user.role);
    localStorage.setItem('swapify_user', JSON.stringify(user));
    if (user.email) localStorage.setItem('email', user.email);
    if (user.id) localStorage.setItem('user_id', String(user.id));

    this.userData.next(user);
  }

  /** ✅ Clear all tokens and user data */
  clearToken() {
    localStorage.removeItem('swapify_token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImg');
    localStorage.removeItem('role');
    localStorage.removeItem('swapify_user');
    localStorage.removeItem('user_id');

    this.loggedIn.next(false);
    this.userData.next(null);

    // Ensure Echo disconnects
    this.echoService.disconnect();
  }

  /** ✅ Observable login state */
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  /** ✅ Check auth state */
  checkAuthStatus() {
    const tokenExists = !!localStorage.getItem('swapify_token');
    this.loggedIn.next(tokenExists);
  }

  /** ✅ Update profile info dynamically */
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
