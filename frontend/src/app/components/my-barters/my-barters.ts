// src/app/components/my-barters/my-barters.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BarterService, Barter, BarterViewModel } from '../../services/barter';

@Component({
  selector: 'app-my-barters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-barters.html',
  styleUrls: ['./my-barters.css'],
})
export class MyBarters implements OnInit {
  barters: BarterViewModel[] = [];
  isLoading = true;

  constructor(private barterService: BarterService, private router: Router) {}

  ngOnInit() {
    this.loadMyBarters();
  }

  loadMyBarters() {
    this.isLoading = true;
    this.barterService.getMyBarters().subscribe({
      next: (rawBarters) => {
        this.barters = rawBarters.map((barter) => this.formatBarter(barter));
        this.isLoading = false;
      },
      error: (err) => {
        alert('Failed to load your barters: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  private formatBarter(barter: Barter): BarterViewModel {
    const currentUserId = this.getCurrentUserId();
    const partner = barter.participants.find((p) => p.id !== currentUserId);
    const myListing = barter.listings.find((l) => l.owner_user_id === currentUserId);
    const theirListing = barter.listings.find((l) => l.owner_user_id !== currentUserId);

    const title =
      myListing && theirListing ? `${myListing.title} to ${theirListing.title}` : 'Barter Exchange';

    return {
      id: barter.id,
      title,
      partner: partner?.username || 'Unknown User',
      status: this.formatStatus(barter.status),
      date: new Date(barter.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      raw: barter,
    };
  }

  private getCurrentUserId(): number {
    const user = JSON.parse(localStorage.getItem('swapify_user') || '{}');
    return user.id || 0;
  }

  private formatStatus(status: string): string {
    const map: { [key: string]: string } = {
      proposed: 'Pending',
      accepted: 'Ongoing',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
    };
    return map[status] || status;
  }

  viewDetails(id: number) {
    this.router.navigate(['/barter-details', id]);
  }
}
