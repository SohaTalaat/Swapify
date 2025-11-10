import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Notification {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private initialized = false;
  private audioNotification = new Audio('/assets/notification.mp3'); // Add sound file

  notifications = new BehaviorSubject<any[]>([]);
  unreadCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private zone: NgZone) { }

  init(userId: number, token: string) {

    // Prevent double initialization
    if (this.initialized) return;
    this.initialized = true;

    // Use global Echo instance from main.ts
    if (!window.Echo) {
      console.error(' Echo not initialized. Check main.ts');
      return;
    }

    // Set auth token for private channels
    if (window.Echo && window.Echo.connector?.options?.auth) {
      window.Echo.connector.options.auth.headers = {
        ...window.Echo.connector.options.auth.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    // ✅ Listen for real-time notifications
    window.Echo.private(`user.${userId}`)
      .listen('.notification.created', (data: any) => {
        console.log('📩 New notification (Pusher):', data);

        this.zone.run(() => {
          // Prevent duplicates
          const current = this.notifications.value;
          if (!current.find((n) => n.id === data.id)) {
            this.notifications.next([data, ...current]);
            this.unreadCount.next(this.unreadCount.value + 1);
          }
        });
      });

    console.log(' Notifications initialized for user:', userId);
    this.loadNotifications(token);
  }

  loadNotifications(token: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get(`${this.apiUrl}/notifications`, { headers }).subscribe((res: any) => {
      this.zone.run(() => {
        // Remove duplicates by ID
        const unique = [
          ...new Map(res.notifications.map((n: any) => [n.id, n])).values(),
        ];
        this.notifications.next(unique);
        this.unreadCount.next(res.count_unread);
      });
    });
  }

  markAsRead(id: number, token: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {}, { headers }).subscribe(() => {
      this.zone.run(() => {
        const updated = this.notifications.value.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        this.notifications.next(updated);
        this.unreadCount.next(updated.filter((n) => !n.is_read).length);
      });
    });
  }
}
