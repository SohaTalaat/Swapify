import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Home } from './components/home/home';
import { ProfilePage } from './components/profile-page/profile-page';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Home, ProfilePage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
