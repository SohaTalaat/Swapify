import { Component } from '@angular/core';
import { About } from '../about/about';
@Component({
  selector: 'app-home',
  imports: [About],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  features = [
    {
      icon: '💬',
      title: 'Easy Communication',
      desc: 'Chat directly with other users to negotiate exchanges.',
    },
    { icon: '🔄', title: 'Smart Matching', desc: 'Our system matches offers automatically.' },
    { icon: '⭐', title: 'Trusted Community', desc: 'Rate users and build your credibility.' },
  ];
}
