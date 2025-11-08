// src/main.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// تعريف global variables
declare global {
  interface Window {
    Echo: any;
    Pusher: any;
  }
}

// إعداد Pusher و Echo
window.Pusher = Pusher;
window.Echo = new Echo({
  broadcaster: 'pusher',
  key: 'ee780b9d138923a2bcf4',
  cluster: 'mt1',
  forceTLS: false, // للـ localhost يفضل false
  authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
  auth: {
    headers: {
      // لا تستخدم Authorization Bearer مع SESSION_DRIVER=cookie
    },
  },
  withCredentials: true, // مهم جدًا
});

// تفعيل وضع الإنتاج إذا كان environment.production = true
const environment = { production: false };
if (environment.production) enableProdMode();

// تشغيل التطبيق
bootstrapApplication(App, appConfig).catch((err) => console.error('Bootstrap failed:', err));
