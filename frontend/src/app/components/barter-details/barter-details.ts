// src/app/components/barter-details/barter-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BarterService, Barter, BarterMessage } from '../../services/barter';
import { Router } from '@angular/router'; // 👈 استورد Router

interface BarterViewModel {
  id: number;
  partner: string;
  status: string;
  yourOffer: { title: string; image: string };
  partnerOffer: { title: string; image: string };
  messages: { sender: string; text: string; time: string }[];
  role: 'offering' | 'requesting'; // ✅ أضف هذا السطر
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

  constructor(
    private route: ActivatedRoute,
    private barterService: BarterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.barterId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBarter();
  }

  /** 🔵 تحميل البيانات من السيرفر */
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

  /** 🧩 تجهيز البيانات للعرض في الواجهة */
  private formatBarter(barter: Barter): BarterViewModel {
    const currentUserId = this.getCurrentUserId();
    console.log('🧩 Current user ID:', currentUserId);
    console.log('📦 Barter listings:', barter.listings);

    const partner = barter.participants.find((p) => p.id !== currentUserId);

    // تأكد أن كل listing فيها pivot
    barter.listings.forEach((l) => {
      if (!l.pivot) {
        console.warn('⚠️ Missing pivot for listing:', l);
      }
    });

    const myListing = barter.listings.find(
      (l) => l.pivot && l.pivot.owner_user_id === currentUserId
    );
    const theirListing = barter.listings.find(
      (l) => l.pivot && l.pivot.owner_user_id !== currentUserId
    );

    console.log('✅ My listing:', myListing);
    console.log('🤝 Their listing:', theirListing);

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
    const myParticipant = barter.participants.find((p) => p.id === currentUserId);
    const myRole = myParticipant?.pivot?.role || 'offering'; // ممكن يكون 'offering' أو 'requesting'

    return {
      id: barter.id, // ✅ أضف هذا السطر
      partner: partner?.username || 'Unknown',
      status: this.formatStatus(barter.status),
      yourOffer,
      partnerOffer,
      messages,
      role: myRole, // ✅ أضفناها هنا
    };
  }

  /** 🟡 استخراج ID المستخدم الحالي من localStorage */
  private getCurrentUserId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('swapify_user') || '{}');
      return user?.id || 0;
    } catch {
      return 0;
    }
  }

  /** 🟢 تنسيق حالة المقايضة */
  private formatStatus(status: string): string {
    const map: Record<string, string> = {
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

  /** 💬 إرسال رسالة في الدردشة */
  sendMessage() {
    if (!this.newMessage.trim()) return;

    const payload = { message: this.newMessage };
    this.barterService.sendMessage(this.barterId, payload).subscribe({
      next: () => {
        this.loadBarter(); // إعادة التحميل بعد الإرسال
        this.newMessage = '';
      },
      error: (err) => {
        alert('Failed to send message: ' + err.message);
      },
    });
  }

  updateStatus(newStatus: string) {
    if (!this.viewModel) return;

    // 🧭 خريطة تحويل القيم من الواجهة إلى ENUM في Laravel
    const statusMap: Record<string, string> = {
      Pending: 'proposed',
      Ongoing: 'accepted',
      Completed: 'completed',
      Cancelled: 'cancelled',
    };

    const backendStatus = statusMap[newStatus] || newStatus;

    this.barterService.updateStatus(this.viewModel.id, backendStatus).subscribe({
      next: (res) => {
        this.viewModel.status = this.formatStatus(res.barter.status); // 🔄 نحدّث الواجهة
        console.log('✅ Status updated to:', res.barter.status);
      },
      error: (err) => {
        console.error('❌ Failed to update status:', err);
        alert(err.error?.message || 'Failed to update status');
      },
    });
  }
  deleteBarter() {
    if (!confirm('Are you sure you want to cancel this barter?')) return;

    this.barterService.deleteBarter(this.viewModel.id).subscribe({
      next: () => {
        alert('Barter cancelled and removed successfully.');
        this.router.navigate(['/my-barters']); // ✅ رجّع المستخدم لصفحة البارترز
      },
      error: (err) => {
        console.error('❌ Failed to delete barter:', err);
        alert(err.error?.message || 'Failed to delete barter');
      },
    });
  }
}
