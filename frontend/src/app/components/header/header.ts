// src/app/components/header/header.ts
import { Component, OnInit, NgZone } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  profileImg: string | null = null;
  showNotifications = false;
  unreadCount = 0;

  notifications: any[] = [];

  constructor(
    private auth: Auth,
    private router: Router,
    private zone: NgZone,
    private notifService: Notification
  ) {
    // Close dropdown when clicking outside
    document.addEventListener('click', (event: any) => {
      const target = event.target;
      if (!target.closest('.notification-wrapper')) {
        this.zone.run(() => (this.showNotifications = false));
      }
    });
  }

  toggleNotifications() {
    this.zone.run(() => {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        const token = localStorage.getItem('swapify_token');
        if (token) this.notifService.loadNotifications(token);
      }
    });
  }


  goToNotifications() {
    this.showNotifications = false;
    this.router.navigate(['/notifications']);
  }

  ngOnInit() {
    const token = localStorage.getItem('swapify_token');
    this.isLoggedIn = !!token;

    const userRole = localStorage.getItem('role');
    this.isAdmin = userRole === 'admin';
    const userId = Number(localStorage.getItem('user_id'));

    if (token && userId) {
      this.notifService.init(userId, token);

      // ✅ Force change detection
      this.notifService.notifications.subscribe((list) => {
        this.zone.run(() => {
          this.notifications = list.map((n) => ({
            ...n,
            message: n.message || n.title,
            created_at: n.created_at || 'Just now',
          }));
        });
        console.log('🔔 Header notifications updated:', this.notifications);
      });

      this.notifService.unreadCount.subscribe((count) => {
        this.zone.run(() => (this.unreadCount = count));
      });
    }

    const user = {
      username: localStorage.getItem('username'),
      profileImg: localStorage.getItem('profileImg') || 'assets/avatar.png',
    };
    if (user.username) {
      this.username = user.username;
      this.profileImg = user.profileImg;
    }

    this.auth.userData.subscribe((userData) => {
      if (userData) {
        this.username = userData.username;
        this.profileImg = userData.profile_picture_url || 'assets/avatar.png';
        this.isAdmin = userData.role === 'admin';
      } else {
        this.username = null;
        this.profileImg = null;
        this.isAdmin = false;
      }
    });

    this.auth.isLoggedIn.subscribe((status) => (this.isLoggedIn = status));
  }



  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearToken();
        this.username = null;
        this.isAdmin = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.auth.clearToken();
        this.username = null;
        this.isAdmin = false;
        this.router.navigate(['/login']);
      },
    });
  }
}
