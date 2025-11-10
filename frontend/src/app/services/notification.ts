import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private initialized = false;
  private audioNotification = new Audio('/assets/notification.mp3');

  notifications = new BehaviorSubject<any[]>([]);
  unreadCount = new BehaviorSubject<number>(0);

  // Notification settings
  private settings = {
    soundEnabled: true,
    desktopEnabled: true,
  };

  constructor(private http: HttpClient, private zone: NgZone) {
    this.requestDesktopPermission();
  }

  init(userId: number, token: string) {

    // Prevent double initialization
    if (this.initialized) return;
    this.initialized = true;

    // Use global Echo instance from main.ts
    if (!window.Echo) {
      console.error(' Echo not initialized.');
      return;
    }

    // Set auth token for private channels
    if (window.Echo && window.Echo.connector?.options?.auth) {
      window.Echo.connector.options.auth.headers = {
        ...window.Echo.connector.options.auth.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    // Listen for real-time notifications
    window.Echo.private(`user.${userId}`)
      .listen('.notification.created', (data: any) => {
        console.log('📩 New notification (Pusher):', data);

        this.zone.run(() => {
          // Prevent duplicates
          const current = this.notifications.value;
          const isDuplicate = current.some(n =>
            n.id === data.id ||
            (n.message === data.message &&
              n.type === data.type &&
              n.related_barter_id === data.related_barter_id)
          );

          if (!isDuplicate) {
            this.notifications.next([data, ...current]);
            this.unreadCount.next(this.unreadCount.value + 1);

            //  Play sound
            this.playSound();

            // ✅ Show desktop notification
            this.showDesktopNotification(data);
          } else {
            console.log('⚠️ Duplicate notification prevented:', data);
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

  markAllAsRead(token: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const unreadIds = this.notifications.value.filter(n => !n.is_read).map(n => n.id);

    unreadIds.forEach(id => {
      this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {}, { headers }).subscribe();
    });
    this.zone.run(() => {
      const updated = this.notifications.value.map(n => ({ ...n, is_read: true }));
      this.notifications.next(updated);
      this.unreadCount.next(0);
    });
  }

  // Desktop notification
  private requestDesktopPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  private showDesktopNotification(data: any) {
    if (!this.settings.desktopEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const notification = new Notification('Swapify', {
      body: data.message || data.title,
      icon: '/assets/logo.png',
      badge: '/assets/logo.png',
      tag: `notification-${data.id}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);
  }

  // Sound notification
  private playSound() {
    if (!this.settings.soundEnabled) return;

    this.audioNotification.volume = 0.5;
    this.audioNotification.play().catch(err => {
      console.log('Sound play failed:', err);
    });
  }

  //  Settings management
  toggleSound(enabled: boolean) {
    this.settings.soundEnabled = enabled;
    localStorage.setItem('notification_sound', enabled.toString());
  }

  toggleDesktop(enabled: boolean) {
    this.settings.desktopEnabled = enabled;
    localStorage.setItem('notification_desktop', enabled.toString());

    if (enabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  getSettings() {
    return {
      soundEnabled: localStorage.getItem('notification_sound') !== 'false',
      desktopEnabled: localStorage.getItem('notification_desktop') !== 'false',
    };
  }
}
