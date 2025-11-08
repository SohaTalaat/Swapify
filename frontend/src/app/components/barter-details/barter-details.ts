// src/app/components/barter-details/barter-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BarterService, Barter } from '../../services/barter';
import { interval, Subscription } from 'rxjs';

interface BarterViewModel {
  id: number;
  partner: string;
  status: string;
  yourOffer: { title: string; image: string };
  partnerOffer: { title: string; image: string };
  messages: { sender: string; text: string; time: string }[];
  role: 'offering' | 'requesting';
}

@Component({
  selector: 'app-barter-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barter-details.html',
  styleUrls: ['./barter-details.css'],
})
export class BarterDetails implements OnInit, OnDestroy {
  barterId!: number;
  barter!: Barter;
  viewModel!: BarterViewModel;
  newMessage = '';
  isLoading = true;

  private pollingSub!: Subscription;
  private lastMessageId = 0;

  constructor(
    private route: ActivatedRoute,
    private barterService: BarterService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.barterId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBarter();
  }

  ngOnDestroy() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }

  /** تحميل بيانات المقايضة */
  private loadBarter() {
    this.isLoading = true;
    this.barterService.getBarter(this.barterId).subscribe({
      next: (barter) => {
        this.barter = barter;
        this.viewModel = this.formatBarter(barter);
        this.isLoading = false;

        // نحدد آخر رسالة موجودة
        if (barter.chat?.messages?.length) {
          this.lastMessageId = Math.max(...barter.chat.messages.map((m) => m.id));
        }

        // بدء polling للرسائل الجديدة
        this.startPolling();
      },
      error: (err) => {
        alert('Failed to load barter: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  /** بدء polling */
  private startPolling() {
    this.pollingSub = interval(1000).subscribe(() => this.checkNewMessages());
  }

  /** تحقق من وجود رسائل جديدة */
  private checkNewMessages() {
    if (!this.barter?.chat?.id) return;

    this.http
      .get<any[]>(
        `http://127.0.0.1:8000/api/chat/${this.barter.chat.id}/messages/latest?last_message_id=${this.lastMessageId}`
      )
      .subscribe({
        next: (messages) => {
          messages.forEach((msg) => {
            this.viewModel.messages.push({
              sender: msg.sender_id === this.getCurrentUserId() ? 'You' : msg.sender.username,
              text: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              }),
            });
            this.lastMessageId = Math.max(this.lastMessageId, msg.id);
          });
        },
        error: (err) => console.error('Polling failed:', err),
      });
  }

  /** إرسال رسالة */
  sendMessage() {
    if (!this.newMessage.trim()) return;

    const payload = { content: this.newMessage };
    const tempMessage = this.newMessage;
    this.newMessage = '';

    this.barterService.sendMessage(this.barterId, payload).subscribe({
      next: (res) => {
        // res.message.id هو ID الرسالة من السيرفر
        const newMsg = {
          sender: 'You',
          text: tempMessage,
          time: new Date(res.message.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
        };

        this.viewModel.messages.push(newMsg);
        this.lastMessageId = Math.max(this.lastMessageId, res.message.id);
      },
      error: (err) => {
        alert('Failed to send message: ' + err.message);
        this.newMessage = tempMessage; // إعادة النص إذا فشل الإرسال
      },
    });
  }

  /** تحديث الحالة */
  updateStatus(newStatus: string) {
    if (!this.viewModel) return;

    const statusMap: Record<string, string> = {
      Pending: 'proposed',
      Ongoing: 'accepted',
      Completed: 'completed',
      Cancelled: 'cancelled',
    };

    const backendStatus = statusMap[newStatus] || newStatus;

    this.barterService.updateStatus(this.viewModel.id, backendStatus).subscribe({
      next: (res) => (this.viewModel.status = this.formatStatus(res.barter.status)),
      error: (err) => alert(err.error?.message || 'Failed to update status'),
    });
  }

  /** حذف المقايضة */
  deleteBarter() {
    if (!confirm('Are you sure you want to cancel this barter?')) return;

    this.barterService.deleteBarter(this.viewModel.id).subscribe({
      next: () => {
        alert('Barter cancelled successfully.');
        this.router.navigate(['/my-barters']);
      },
      error: (err) => alert(err.error?.message || 'Failed to delete barter'),
    });
  }

  /** تنسيق البيانات للعرض */
  private formatBarter(barter: Barter): BarterViewModel {
    const currentUserId = this.getCurrentUserId();
    const partner = barter.participants.find((p) => p.id !== currentUserId);

    const myListing = barter.listings.find((l) => l.pivot?.owner_user_id === currentUserId);
    const theirListing = barter.listings.find((l) => l.pivot?.owner_user_id !== currentUserId);

    const messages = (barter.chat?.messages || []).map((msg) => ({
      sender:
        msg.sender_id === currentUserId
          ? 'You'
          : msg.sender?.username || partner?.username || 'Partner',
      text: msg.content,
      time: new Date(msg.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }));

    const myParticipant = barter.participants.find((p) => p.id === currentUserId);
    const myRole = myParticipant?.pivot?.role || 'offering';

    return {
      id: barter.id,
      partner: partner?.username || 'Unknown',
      status: this.formatStatus(barter.status),
      yourOffer: {
        title: myListing?.title || 'Your Offer',
        image: myListing?.images?.[0]?.image_url || 'assets/placeholder.jpg',
      },
      partnerOffer: {
        title: theirListing?.title || 'Their Offer',
        image: theirListing?.images?.[0]?.image_url || 'assets/placeholder.jpg',
      },
      messages,
      role: myRole,
    };
  }

  /** استخراج ID المستخدم من localStorage */
  private getCurrentUserId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('swapify_user') || '{}');
      return user?.id || 0;
    } catch {
      return 0;
    }
  }

  /** تنسيق الحالة */
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
}
