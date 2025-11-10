import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class Notifications implements OnInit {
  notifications: any[] = [];
  loading = true;

  constructor(private notifService: NotificationService) { }

  ngOnInit() {
    const token = localStorage.getItem('swapify_token');
    if (!token) {
      alert('Please login to view notifications.');
      this.loading = false;
      return;
    }

    // Load existing notifications
    this.notifService.loadNotifications(token);

    // Subscribe to the BehaviorSubject so it updates live
    this.notifService.notifications.subscribe((list) => {
      this.notifications = list.map((n) => ({
        ...n,
        read: n.is_read, // backend sends is_read
        title: n.message, // backend sends message instead of title
        time: n.created_at, // backend sends created_at
      }));
      this.loading = false;
    });
  }

  markAsRead(n: any) {
    const token = localStorage.getItem('swapify_token');
    if (!n.read && token) {
      this.notifService.markAsRead(n.id, token);
    }
  }
}
