import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.css'],
})
export class Faq {
  faqs = [
    {
      question: 'Q: How do I use the platform?',
      answer:
        'A: Simply register an account, create your offer, and browse available listings to start bartering with others.',
    },
    {
      question: 'Q: Is registration free?',
      answer: 'A: Yes, creating an account and using Swapify is completely free.',
    },
    {
      question: 'Q: How do I contact support?',
      answer:
        'A: You can reach us anytime through the "Contact Us" page or via swapifyservices@gmail.com.',
    },
    {
      question: 'Q: What can I exchange on Swapify?',
      answer:
        'A: You can trade both physical products and digital services — like logo design, writing, or electronics.',
    },
    {
      question: 'Q: How does the barter system work?',
      answer:
        'A: Each user lists what they offer and what they want in return. If both sides match, the system suggests a barter connection.',
    },
    {
      question: 'Q: Is there any payment or money involved?',
      answer:
        'A: No, Swapify is a cash-free platform. It’s all about trading items and skills fairly without money exchange.',
    },
    {
      question: 'Q: How do I know if the other user is trustworthy?',
      answer:
        'A: After each successful barter, users can rate and review each other. Verified users also have identity checks for extra trust.',
    },
    {
      question: 'Q: Can I edit or delete my offer after posting?',
      answer:
        'A: Yes, you can manage your offers anytime from your dashboard — edit details or remove them if no longer available.',
    },
    {
      question: 'Q: What happens if there’s a problem during a trade?',
      answer:
        'A: You can open a dispute. Our admin team will review the issue, evidence, and help resolve it fairly.',
    },
    {
      question: 'Q: Do you offer identity verification?',
      answer:
        'A: Yes. Users can upload official ID documents for verification to build credibility within the community.',
    },
    {
      question: 'Q: How do I receive notifications?',
      answer:
        'A: You’ll get instant notifications inside the app whenever someone sends you a barter request or a message.',
    },
    {
      question: 'Q: Is there a shipping or delivery system?',
      answer:
        'A: Yes, Swapify supports a shipping option for physical trades. You can choose a preferred address and delivery method.',
    },
    {
      question: 'Q: Can I deactivate my account?',
      answer:
        'A: Yes, you can deactivate or delete your account anytime from the Settings page. Your data will remain secure.',
    },
  ];
}
