import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.html',
  styleUrls: ['./subscription.css']
})
export class Subscription {

  plans = [
    { name: 'Free', price: 0, barters: 2, tier: 'free' },
    { name: 'Basic', price: 10, barters: 5, tier: 'basic' },
    { name: 'Pro', price: 20, barters: 10, tier: 'pro' }
  ];

  loading = false;
  apiUrl = 'https://vegas-privilege-wellness-exclusive.trycloudflare.com/api';

  constructor(private http: HttpClient) { }

  subscribe(plan: any, paymentType: 'card' | 'wallet' = 'card') {
    this.loading = true;

    const token = localStorage.getItem('swapify_token');
    if (!token) {
      alert('Please login first.');
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });

    // Free plan — no payment
    if (plan.price === 0) {
      this.http.post(`${this.apiUrl}/subscriptions`, { tier: plan.tier }, { headers }).subscribe({
        next: () => {
          alert('Free plan activated successfully!');
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
      return;
    }

    // Paid plan — choose method
    const amount = plan.price;

    this.http.post(`${this.apiUrl}/paymob/init`, { amount, payment_type: paymentType }, { headers }).subscribe({
      next: (res: any) => {
        if (paymentType === 'card' && res.url) {
          window.location.href = res.url;
        } else if (paymentType === 'wallet' && res.wallet_response?.redirect_url) {
          window.location.href = res.wallet_response.redirect_url;
        } else {
          console.warn('Unexpected Paymob response:', res);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Payment failed. Please try again.');
        this.loading = false;
      }
    });
  }
}
