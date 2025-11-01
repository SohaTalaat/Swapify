import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-start-barter',
  imports: [CommonModule, FormsModule],
  templateUrl: './start-barter.html',
  styleUrl: './start-barter.css',
})
export class StartBarter {
  userOffers = [
    { id: 1, title: 'Logo Design Service' },
    { id: 2, title: 'Photography Session' },
    { id: 3, title: 'Web Development Help' },
  ];

  selectedOffer = '';
  wantedItem = '';
  message = '';

  startBarter() {
    if (!this.selectedOffer || !this.wantedItem) {
      alert('Please select your offer and enter what you want.');
      return;
    }

    alert(`🎉 Barter started successfully!
    Your offer: ${this.selectedOffer}
    Wanted: ${this.wantedItem}`);
  }
}
