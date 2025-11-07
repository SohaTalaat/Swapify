import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.html',
  styleUrls: ['./subscription.css'],
})
export class Subscription {
  plans = [
    { name: 'Free', price: 0, barters: 2, tier: 'free' },
    { name: 'Basic', price: 10, barters: 5, tier: 'basic' },
    { name: 'Pro', price: 20, barters: 10, tier: 'pro' },
  ];

  selectedPlan: any = null;
  loading = false;
  walletNumber = '';
  apiUrl = 'https://graduated-startup-pensions-cork.trycloudflare.com/api';

  constructor(private http: HttpClient) { }

  openWalletModal(plan: any) {
    this.selectedPlan = plan;
    const modalEl = document.getElementById('walletModal')!;
    const modal = new Modal(modalEl);
    modal.show();
  }

  confirmWalletPayment() {
    if (!this.walletNumber || this.walletNumber.length !== 11) {
      alert('Please enter a valid 11-digit wallet number.');
      return;
    }

    const modalEl = document.getElementById('walletModal')!;
    const modal = Modal.getInstance(modalEl)!;
    modal.hide();

    this.subscribe(this.selectedPlan, 'wallet');
  }

  subscribe(plan: any, paymentType: 'card' | 'wallet' | 'manual') {
    this.loading = true;

    const token = localStorage.getItem('swapify_token');
    if (!token) {
      alert('Please login first.');
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });

    if (plan.price === 0) {
      this.http
        .post(`${this.apiUrl}/subscriptions`, { tier: plan.tier }, { headers })
        .subscribe({
          next: () => {
            alert('Free plan activated successfully!');
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          },
        });
      return;
    }

    const data: any = { amount: plan.price, payment_type: paymentType };
    if (paymentType === 'wallet') data.wallet_number = this.walletNumber;

    this.http.post(`${this.apiUrl}/paymob/init`, data, { headers }).subscribe({
      next: (res: any) => {
        if (res.url) window.location.href = res.url;
        else if (res.wallet_response?.redirect_url)
          window.location.href = res.wallet_response.redirect_url;
        else {
          console.warn('Unexpected Paymob response:', res);
          alert('Please check your wallet number or try again.');
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Payment failed. Please try again.');
        this.loading = false;
      },
    });
  }
}
