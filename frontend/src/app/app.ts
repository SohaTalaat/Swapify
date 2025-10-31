import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Home } from './components/home/home';
import { ProfilePage } from './components/profile-page/profile-page';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Home, ProfilePage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private auth: Auth) {}

  ngOnInit() {
    // ✅ تأكيد حالة تسجيل الدخول عند تشغيل التطبيق
    this.auth.checkAuthStatus();
  }
}
