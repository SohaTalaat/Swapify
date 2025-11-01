import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isLoggedIn = false;
  username: string | null = null;
  profileImg: string | null = null;

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('swapify_token');
    this.isLoggedIn = !!token;

    // اقرأ البيانات المحفوظة من localStorage
    const user = {
      username: localStorage.getItem('username'),
      profileImg: localStorage.getItem('profileImg'),
    };
    if (user.username) {
      this.username = user.username;
      this.profileImg = user.profileImg;
    }

    // 🔥 اشترك في إشعارات تسجيل الدخول / تغيير الصورة
    this.auth.userData.subscribe((userData) => {
      if (userData) {
        this.username = userData.username;
        this.profileImg = userData.profile_picture_url || 'assets/avatar.png';
      } else {
        this.username = null;
        this.profileImg = null;
      }
    });

    // اشترك أيضًا في حالة تسجيل الدخول
    this.auth.isLoggedIn.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearToken();
        this.username = null;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.auth.clearToken();
        this.username = null;
        this.router.navigate(['/login']);
      },
    });
  }
}
