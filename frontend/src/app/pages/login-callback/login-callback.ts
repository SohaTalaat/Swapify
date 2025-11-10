import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth'; // ✅ استيراد الخدمة

@Component({
  selector: 'app-login-callback',
  imports: [CommonModule],
  templateUrl: './login-callback.html',
  styleUrl: './login-callback.css',
})
export class LoginCallback implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = 'Logging you in...';
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: Auth // ✅ نضيف الخدمة هنا
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const email = params['email'];
      const profileImg = params['profileImg'];
      const error = params['error'];

      if (error) {
        this.status = 'error';
        this.message = 'Login failed: ' + decodeURIComponent(error);
        setTimeout(() => this.router.navigate(['/login']), 2500);
        return;
      }
      if (token) {
        this.status = 'loading';
        this.message = 'Fetching your profile...';

        // ✅ خزّن التوكن مؤقتًا
        localStorage.setItem('swapify_token', token);

        // ✅ نطلب بيانات المستخدم الكاملة من الـ API
        this.http
          .get(`${this.apiUrl}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .subscribe({
            next: (user: any) => {
              // ✅ خزّن كل البيانات زي تسجيل الدخول العادي
              localStorage.setItem('swapify_user', JSON.stringify(user));
              localStorage.setItem('email', user.email);
              localStorage.setItem('role', user.role);
              localStorage.setItem('profileImg', user.profile_picture_url || 'assets/avatar.png');

              // ✅ حدّث Auth service
              this.auth.setUserData(user);
              this.auth.setToken(token);

              this.status = 'success';
              this.message = '✅ Logged in successfully!';
              setTimeout(() => this.router.navigate(['/profile']), 1500);
            },
            error: (err) => {
              console.error('Error fetching user data', err);
              this.status = 'error';
              this.message = 'Could not load your profile data.';
              setTimeout(() => this.router.navigate(['/login']), 2000);
            },
          });
      } else {
        this.status = 'error';
        this.message = 'Invalid login attempt.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    });
  }
}
