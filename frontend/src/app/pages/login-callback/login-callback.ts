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
        this.status = 'success';
        this.message = 'Login successful! Redirecting...';

        // ✅ خزّن البيانات
        localStorage.setItem('swapify_token', token);
        if (email) localStorage.setItem('email', email);
        if (profileImg) localStorage.setItem('profileImg', profileImg);

        // ✅ حدّث Auth service علشان الـ Header يعرف
        this.auth.userData.next({
          username: email?.split('@')[0] || 'User',
          profile_picture_url: profileImg,
        });
        this.auth.loggedIn.next(true);

        setTimeout(() => this.router.navigate(['/profile']), 1500);
      } else {
        this.status = 'error';
        this.message = 'Invalid login attempt.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    });
  }
}
