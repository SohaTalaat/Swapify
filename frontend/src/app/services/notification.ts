import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import Echo from 'laravel-echo';
import { BehaviorSubject } from 'rxjs';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class Notification {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private echo!: Echo<any>;
  private initialized = false;

  notifications = new BehaviorSubject<any[]>([]);
  unreadCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private zone: NgZone) { }

  init(userId: number, token: string) {
    // ✅ Prevent double initialization
    if (this.initialized) return;
    this.initialized = true;

    (window as any).Pusher = Pusher;
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: '3ad51a0a95a1b73945f5',
      cluster: 'eu',
      forceTLS: true,
      authEndpoint: `http://127.0.0.1:8000/broadcasting/auth`,
      auth: { headers: { Authorization: `Bearer ${token}` } },
    });

    // ✅ Listen for real-time notifications
    this.echo.private(`user.${userId}`).listen('.notification.created', (data: any) => {
      console.log('New notification (Pusher):', data);

      this.zone.run(() => {
        // Prevent duplicates if same ID already exists
        const current = this.notifications.value;
        if (!current.find((n) => n.id === data.id)) {
          this.notifications.next([data, ...current]);
          this.unreadCount.next(this.unreadCount.value + 1);
        }
      });
    });

    this.loadNotifications(token);
  }

  loadNotifications(token: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get(`${this.apiUrl}/notifications`, { headers }).subscribe((res: any) => {
      this.zone.run(() => {
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
