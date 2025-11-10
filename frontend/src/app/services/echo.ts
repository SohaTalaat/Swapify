import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  private echo!: Echo<any>;

  initEcho(token: string | null) {
    if (this.echo) {
      console.log('♻️ Reusing existing Echo instance');
      // Update token dynamically
      this.echo.connector.options.auth.headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      };
      return;
    }

    (window as any).Pusher = Pusher;

    this.echo = new Echo({
      broadcaster: 'pusher',
      key: 'ee780b9d138923a2bcf4',
      cluster: 'mt1',
      forceTLS: true,
      authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
      auth: {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    });

    (window as any).Echo = this.echo;

    console.log('🔄 Echo initialized with token:', token ? '✅ Present' : '❌ None');
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      console.log(' Echo disconnected');
    }
  }

  get instance(): Echo<any> {
    return this.echo;
  }
}
