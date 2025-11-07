import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { PaymentService } from '../../services/payment';
@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.html',
  styleUrls: ['./subscription.css'],
})
export class Subscription {
  plans = [
    {
      name: 'Free',
      price: 0,
      barters: 2,
      tier: 'free',
      icon: 'fa-solid fa-gift',
      description: 'Perfect for beginners.',
    },
    {
      name: 'Basic',
      price: 10,
      barters: 5,
      tier: 'basic',
      icon: 'fa-solid fa-star',
      description: 'Unlock more barters.',
      popular: true,
    },
    {
      name: 'Pro',
      price: 20,
      barters: 10,
      tier: 'pro',
      icon: 'fa-solid fa-gem',
      description: 'Unlimited exposure.',
    },
  ];

  currentSubscription: any = null;
  selectedPlan: any = null;
  loading = false;
  walletNumber = '';
  private pollInterval: any;
  apiUrl = 'https://city-ashley-fda-knitting.trycloudflare.com/api';

  constructor(private http: HttpClient, private paymentService: PaymentService) {}

  ngOnInit() {
    this.loadCurrentSubscription();
    this.checkPendingPlan();

    // تحديث كل 3 ثوانٍ بعد الرجوع من Paymob
    this.pollInterval = setInterval(() => {
      if (this.isPaymentReturn()) {
        this.loadCurrentSubscription();
      }
    }, 3000);
  }
  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  // تحميل الاشتراك الحالي
  loadCurrentSubscription() {
    this.paymentService.getSubscription().subscribe({
      next: (sub: any) => {
        this.currentSubscription = sub;
        console.log('Subscription loaded:', sub);
      },
      error: () => {
        this.currentSubscription = null;
      },
    });
  }
  isPaymentReturn(): boolean {
    const urlHasSuccess = window.location.href.includes('payment-success');
    const hasPendingPlan = localStorage.getItem('pending_plan') !== null;
    return urlHasSuccess || hasPendingPlan;
  }

  checkPendingPlan() {
    const pending = localStorage.getItem('pending_plan');
    if (pending) {
      localStorage.removeItem('pending_plan');
      setTimeout(() => this.loadCurrentSubscription(), 2000);
    }
  }
  // فتح نافذة الدفع بالـ Wallet
  openWalletModal(plan: any) {
    this.selectedPlan = plan;
    const modal = new Modal(document.getElementById('walletModal')!);
    modal.show();
  }

  confirmWalletPayment() {
    if (!this.walletNumber || this.walletNumber.length !== 11) {
      alert('أدخل رقم محفظة صحيح (11 رقم)');
      return;
    }
    const modal = Modal.getInstance(document.getElementById('walletModal')!)!;
    modal.hide();
    this.subscribe(this.selectedPlan, 'wallet');
  }

  subscribe(plan: any, paymentType: 'card' | 'wallet' | 'manual' = 'card') {
    if (!plan) return alert('اختر خطة أولاً');
    if (this.currentSubscription?.tier === plan.tier && this.currentSubscription?.is_active) {
      return alert('أنت بالفعل في هذه الخطة!');
    }

    this.loading = true;
    const token = localStorage.getItem('swapify_token');
    if (!token) {
      alert('يجب تسجيل الدخول أولاً');
      this.loading = false;
      return;
    }

    // الخطة المجانية
    if (plan.price === 0) {
      this.paymentService.createSubscription(plan.tier, 'manual').subscribe({
        next: () => {
          alert('تم تفعيل الخطة المجانية بنجاح!');
          this.loadCurrentSubscription();
        },
        error: () => alert('فشل تفعيل الخطة المجانية'),
        complete: () => (this.loading = false),
      });
      return;
    }

    // الدفع عبر Paymob
    const data: any = { amount: plan.price, payment_type: paymentType };
    if (paymentType === 'wallet') data.wallet_number = this.walletNumber;

    this.paymentService.initPayment(data.amount, data.payment_type, data.wallet_number).subscribe({
      next: (res: any) => {
        if (res.url) {
          // حفظ الخطة المختارة مؤقتًا قبل التوجيه
          localStorage.setItem('pending_plan', JSON.stringify(plan));
          window.location.href = res.url;
        } else {
          console.error('Unexpected Paymob response:', res);
          alert('خطأ: الرد من الخادم غير متوقع');
        }
      },
      error: (err) => {
        const msg = err.error?.error || 'فشل بدء الدفع';
        alert(msg);
      },
      complete: () => (this.loading = false),
    });
  }
}
