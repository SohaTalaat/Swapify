import { EchoService } from './services/echo';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private auth: Auth, private echoService: EchoService) { }

  ngOnInit() {
    this.auth.checkAuthStatus();

    const token = localStorage.getItem('swapify_token');
    if (token) {
      this.echoService.initEcho(token);
    }
  }
}
