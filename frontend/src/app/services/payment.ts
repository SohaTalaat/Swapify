import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Payment {
  private apiUrl = 'https://speak-choosing-academy-reports.trycloudflare.com/api';

  constructor(private http: HttpClient) {}

  initPayment(
    amount: number,
    paymentType: 'card' | 'wallet',
    walletNumber?: string
  ): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.post(
      `${this.apiUrl}/paymob/init`,
      {
        amount,
        payment_type: paymentType,
        wallet_number: walletNumber,
      },
      { headers }
    );
  }

  createSubscription(tier: string, paymentMethod: string): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.post(
      `${this.apiUrl}/subscriptions`,
      {
        tier,
        payment_method: paymentMethod,
      },
      { headers }
    );
  }

  getSubscription(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subscriptions`);
  }
}
