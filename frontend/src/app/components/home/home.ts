import { Component } from '@angular/core';
import { About } from '../about/about';
import { BrowseOffers } from '../browse-offers/browse-offers';
import { Contact } from '../contact/contact';
import { Subscription } from '../subscription/subscription';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, About, BrowseOffers, Contact, Subscription],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  features = [
    {
      icon: '💬',
      title: 'Easy Communication',
      desc: 'Chat directly with users to negotiate and swap seamlessly.',
    },
    {
      icon: '🔄',
      title: 'Smart Matching',
      desc: 'Our system automatically finds offers that fit your needs.',
    },
    {
      icon: '⭐',
      title: 'Trusted Community',
      desc: 'Build your credibility and rate other swappers easily.',
    },
  ];
}
