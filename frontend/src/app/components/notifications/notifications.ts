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
  // pagination
  currentPage = 1;
  lastPage = 1;
  perPage = 10;
  total = 0;

  constructor(private notifService: NotificationService) { }

  ngOnInit() {
    const token = localStorage.getItem('swapify_token');
    if (!token) {
      alert('Please login to view notifications.');
      this.loading = false;
      return;
    }
    // Load existing notifications (first page)
    this.notifService.loadNotifications(token, this.currentPage, this.perPage);

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

    this.notifService.pagination.subscribe((p) => {
      this.currentPage = p.current_page || 1;
      this.lastPage = p.last_page || 1;
      this.perPage = p.per_page || 10;
      this.total = p.total || 0;
    });
  }

  markAsRead(n: any) {
    const token = localStorage.getItem('swapify_token');
    if (!n.read && token) {
      this.notifService.markAsRead(n.id, token);
    }
  }

  goToPage(page: number) {
    const token = localStorage.getItem('swapify_token');
    if (!token) return;
    if (page < 1 || page > this.lastPage) return;
    this.loading = true;
    this.notifService.loadNotifications(token, page, this.perPage);
  }

  prevPage() {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.lastPage) this.goToPage(this.currentPage + 1);
  }
}
