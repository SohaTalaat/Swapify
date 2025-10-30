import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  faqs = [
    {
      question: 'Q: How do I use the platform?',
      answer: 'A: You can register and follow the on-screen instructions to manage your projects.',
    },
    { question: 'Q: Is registration free?', answer: 'A: Yes, registration is completely free.' },
    {
      question: 'Q: How do I contact support?',
      answer: 'A: You can reach us via the "Contact Us" page.',
    },
  ];
}
