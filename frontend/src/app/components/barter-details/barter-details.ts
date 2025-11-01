import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-barter-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './barter-details.html',
  styleUrl: './barter-details.css',
})
export class BarterDetails {
  barter = {
    partner: 'Sara Ahmed',
    status: 'Ongoing',
    yourOffer: { title: 'Logo Design Service', image: 'assets/offers/design.jpg' },
    partnerOffer: { title: 'Content Writing', image: 'assets/offers/writing.jpg' },
    messages: [
      { sender: 'You', text: 'Hi, ready to start the exchange?' },
      { sender: 'Sara', text: 'Yes, let’s finalize details!' },
    ],
  };

  newMessage = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.barter.messages.push({ sender: 'You', text: this.newMessage });
      this.newMessage = '';
    }
  }
}
