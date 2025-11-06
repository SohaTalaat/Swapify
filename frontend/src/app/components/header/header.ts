// src/app/components/header/header.ts
import { Component, OnInit, NgZone } from '@angular/core';
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
  isAdmin = false; // ✅ Add this line
  username: string | null = null;
  profileImg: string | null = null;
  showNotifications = false;
  unreadCount = 3;

  notifications = [
    {
      id: 1,
      title: 'New barter request from Sara Ahmed',
      type: 'barter',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      title: 'Your offer “Logo Design” got a comment',
      type: 'offer',
      time: '1 hour ago',
      read: true,
    },
    {
      id: 3,
      title: 'New message from Omar',
      type: 'message',
      time: '3 hours ago',
      read: false,
    },
  ];

  constructor(private auth: Auth, private router: Router, private zone: NgZone) {
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
    });
  }

  goToNotifications() {
    this.showNotifications = false;
    this.router.navigate(['/notifications']);
  }

  ngOnInit() {
    const token = localStorage.getItem('swapify_token');
    this.isLoggedIn = !!token;

    const userRole = localStorage.getItem('role'); // ✅ Get user role
    this.isAdmin = userRole === 'admin'; // ✅ Check if admin

    const user = {
      username: localStorage.getItem('username'),
      profileImg: localStorage.getItem('profileImg'),
    };
    if (user.username) {
      this.username = user.username;
      this.profileImg = user.profileImg;
    }

    this.auth.userData.subscribe((userData) => {
      if (userData) {
        this.username = userData.username;
        this.profileImg = userData.profile_picture_url || 'assets/avatar.png';
        this.isAdmin = userData.role === 'admin'; // ✅ Live update if admin
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
