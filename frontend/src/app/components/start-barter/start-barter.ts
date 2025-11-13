// src/app/components/start-barter/start-barter.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarterService, Listing } from '../../services/barter';
import { UpgradePrompt } from '../upgrade-prompt/upgrade-prompt';

@Component({
  selector: 'app-start-barter',
  standalone: true,
  imports: [CommonModule, FormsModule, UpgradePrompt],
  templateUrl: './start-barter.html',
  styleUrls: ['./start-barter.css'],
})
export class StartBarter implements OnInit {
  userOffers: Listing[] = []; // عروضي
  othersOffers: Listing[] = []; // عروض الآخرين
  shippingAddressText: string | null = null;
  transactionFee: number = 50.0; // 💰 ثابت دائمًا

  selectedOfferId: number | null = null;
  selectedRequestedId: number | null = null;
  wantedItemTitle = '';
  exchangeType: 'delivery' | 'in_person' = 'in_person';
  meetingLocation = '';
  meetingTime = '';
  shippingAddressId: number | null = null;

  isLoading = false;
  // Banned modal state
  bannedModalMessage: string | null = null;
  bannedModalReason: string | null = null;

  // Upgrade modal state
  showUpgradeModal = false;
  upgradeData: any = {
    currentLimit: 2,
    bartersUsed: 0,
    plans: []
  };

  constructor(private barterService: BarterService) { }

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
      payload.shipping_address_text = this.shippingAddressText || null;
    }

    this.isLoading = true;
    this.barterService.createBarter(payload).subscribe({
      next: () => {
        alert('Barter created successfully!');
        this.resetForm();
        this.isLoading = false;
      },
      error: (err: any) => {
        // Handle subscription limit exceeded (402)
        if (err && err.status === 402) {
          this.showUpgradeModal = true;
          this.upgradeData = {
            currentLimit: err.data?.current_limit || 2,
            bartersUsed: err.data?.barters_used || 0,
            plans: err.data?.plans || [
              { tier: 'free', limit: 2, price: 0 },
              { tier: 'pro', limit: 5, price: '$9.99/month' },
              { tier: 'premium', limit: 20, price: '$19.99/month' },
            ]
          };
          this.isLoading = false;
          return;
        }

        // handle structured error from service
        if (err && err.status === 403) {
          const reason = err.data?.ban_reason || null;
          this.bannedModalMessage = err.message || 'Your account is restricted.';
          this.bannedModalReason = reason;
          // show modal
          const el = document.getElementById('bannedModal');
          if (el) {
            // @ts-ignore
            const m = new (window as any).bootstrap.Modal(el);
            m.show();
          } else {
            alert(this.bannedModalMessage + (reason ? '\nReason: ' + reason : ''));
          }
          this.isLoading = false;
          return;
        }

        alert('Error: ' + (err?.message || 'An unknown error occurred!'));
        this.isLoading = false;
      },
    });
  }

  closeUpgradeModal() {
    this.showUpgradeModal = false;
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
