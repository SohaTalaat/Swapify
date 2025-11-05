// src/app/components/start-barter/start-barter.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarterService, Listing } from '../../services/barter';

@Component({
  selector: 'app-start-barter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start-barter.html',
  styleUrls: ['./start-barter.css'],
})
export class StartBarter implements OnInit {
  userOffers: Listing[] = []; // عروضي
  othersOffers: Listing[] = []; // عروض الآخرين

  selectedOfferId: number | null = null;
  selectedRequestedId: number | null = null;
  wantedItemTitle = '';
  exchangeType: 'delivery' | 'in_person' = 'in_person';
  meetingLocation = '';
  meetingTime = '';
  shippingAddressId: number | null = null;

  isLoading = false;

  constructor(private barterService: BarterService) {}

  ngOnInit() {
    this.loadMyListings();
    this.loadOthersListings();
  }

  loadMyListings() {
    this.isLoading = true;
    this.barterService.getMyListings().subscribe({
      next: (listings) => {
        this.userOffers = listings;
        this.isLoading = false;
      },
      error: (err) => {
        alert('Failed to load your offers: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  loadOthersListings() {
    this.barterService.getOthersListings().subscribe({
      next: (listings) => {
        this.othersOffers = listings;
      },
      error: (err) => {
        console.error('Failed to load others offers:', err);
      },
    });
  }

  onRequestedListingSelected() {
    if (!this.selectedRequestedId) {
      this.wantedItemTitle = '';
      return;
    }

    const listing = this.othersOffers.find((l) => l.id === this.selectedRequestedId);
    this.wantedItemTitle = listing?.title || '';
  }

  private getReceiverId(): number {
    const listing = this.othersOffers.find((l) => l.id === this.selectedRequestedId);
    if (!listing?.user_id) {
      throw new Error('Owner of requested listing not found');
    }
    return listing.user_id;
  }

  startBarter() {
    if (!this.selectedOfferId || !this.selectedRequestedId) {
      alert('Please select both your offer and the requested item.');
      return;
    }

    if (this.selectedOfferId === this.selectedRequestedId) {
      alert('You cannot barter the same item.');
      return;
    }

    const payload: any = {
      offered_listing_id: this.selectedOfferId,
      requested_listing_id: this.selectedRequestedId,
      receiver_id: this.getReceiverId(),
      exchange_type: this.exchangeType,
    };

    if (this.exchangeType === 'in_person') {
      payload.meeting_location = this.meetingLocation || null;
      payload.meeting_time = this.meetingTime || null;
    } else {
      payload.shipping_address_id = this.shippingAddressId;
    }

    this.isLoading = true;
    this.barterService.createBarter(payload).subscribe({
      next: () => {
        alert('Barter created successfully!');
        this.resetForm();
        this.isLoading = false;
      },
      error: (err) => {
        alert('Error: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  resetForm() {
    this.selectedOfferId = null;
    this.selectedRequestedId = null;
    this.wantedItemTitle = '';
    this.meetingLocation = '';
    this.meetingTime = '';
    this.shippingAddressId = null;
    this.exchangeType = 'in_person';
  }
}
