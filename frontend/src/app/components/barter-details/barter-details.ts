// src/app/components/barter-details/barter-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BarterService, Barter, BarterMessage } from '../../services/barter';

interface BarterViewModel {
  partner: string;
  status: string;
  yourOffer: { title: string; image: string };
  partnerOffer: { title: string; image: string };
  messages: { sender: string; text: string; time: string }[];
}

@Component({
  selector: 'app-barter-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barter-details.html',
  styleUrls: ['./barter-details.css'],
})
export class BarterDetails implements OnInit {
  barterId!: number;
  barter!: Barter;
  viewModel!: BarterViewModel;
  newMessage = '';
  isLoading = true;

  constructor(private route: ActivatedRoute, private barterService: BarterService) {}

  ngOnInit() {
    this.barterId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBarter();
  }

  loadBarter() {
    this.isLoading = true;
    this.barterService.getBarter(this.barterId).subscribe({
      next: (barter) => {
        this.barter = barter;
        this.viewModel = this.formatBarter(barter);
        this.isLoading = false;
      },
      error: (err) => {
        alert('Failed to load barter: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  private formatBarter(barter: Barter): BarterViewModel {
    const currentUserId = this.getCurrentUserId();
    const partner = barter.participants.find((p) => p.id !== currentUserId);
    const myListing = barter.listings.find((l) => l.owner_user_id === currentUserId);
    const theirListing = barter.listings.find((l) => l.owner_user_id !== currentUserId);

    const yourOffer = {
      title: myListing?.title || 'Your Offer',
      image: myListing?.images?.[0]?.image_url || 'assets/placeholder.jpg',
    };

    const partnerOffer = {
      title: theirListing?.title || 'Their Offer',
      image: theirListing?.images?.[0]?.image_url || 'assets/placeholder.jpg',
    };

    const messages = (barter.chat?.messages || []).map((msg) => ({
      sender:
        msg.user?.username ||
        (msg.sender_id === currentUserId ? 'You' : partner?.username || 'Partner'),
      text: msg.message,
      time: new Date(msg.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }));

    return {
      partner: partner?.username || 'Unknown',
      status: this.formatStatus(barter.status),
      yourOffer,
      partnerOffer,
      messages,
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

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const payload = { message: this.newMessage };
    this.barterService.sendMessage(this.barterId, payload).subscribe({
      next: (response) => {
        // إعادة تحميل الرسائل أو إضافة الرسالة محليًا
        this.loadBarter();
        this.newMessage = '';
      },
      error: (err) => {
        alert('Failed to send message: ' + err.message);
      },
    });
  }
}
