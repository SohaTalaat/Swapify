import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BarterService, Barter } from '../../services/barter';
import { EchoService } from '../../services/echo';
import { Subscription } from 'rxjs';

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
  private hasListener = false;
  private initialized = false;

  private echoChannel: any;
  private typingTimeout: any;
  private userSub?: Subscription;
  isPartnerTyping = false;

  constructor(
    private route: ActivatedRoute,
    private barterService: BarterService,
    private router: Router,
    private zone: NgZone,
    private echoService: EchoService //  shared Echo instance
  ) {
    this.router.events.subscribe(() => {
      if (this.echoChannel && this.barter?.chat?.id) {
        window.Echo.leave(`private-chat.${this.barter.chat.id}`);
        console.log('🧹 Cleaned up channel before route change:', this.barter.chat.id);
        this.echoChannel = null;
      }
    });
  }

  ngOnInit() {
    if (this.initialized) return;
    this.initialized = true;

    console.log('🧠 Initializing BarterDetails for chat:', this.route.snapshot.paramMap.get('id'));
    this.barterId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBarter();
  }


  /** Load barter data from backend */
  private loadBarter() {
    this.isLoading = true;
    this.barterService.getBarter(this.barterId).subscribe({
      next: (barter) => {
        this.barter = barter;
        this.viewModel = this.formatBarter(barter);
        this.isLoading = false;

        // Subscribe to real-time chat if available
        if (barter.chat?.id) {
          this.subscribeToChat();
        }
      },
      error: (err) => {
        alert('Failed to load barter: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  /** Subscribe to Pusher channel for real-time messages */
  private subscribeToChat() {
    if (!this.barter?.chat?.id) return;

    const chatId = this.barter.chat.id;
    const currentUserId = this.getCurrentUserId();

    // ✅ Prevent duplicate listeners
    if (this.hasListener) {
      console.warn('⚠️ Listener already exists for chat:', chatId);
      return;
    }

    // ✅ Set auth token (safe refresh)
    if (!this.echoChannel) {
      const token = localStorage.getItem('swapify_token');
      if (window.Echo && window.Echo.connector?.options?.auth) {
        window.Echo.connector.options.auth.headers = {
          ...window.Echo.connector.options.auth.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // ✅ Subscribe to channel if not already
    this.echoChannel = window.Echo.private(`chat.${chatId}`);

    this.echoChannel.subscribed(() => {
      console.log('✅ Subscribed to chat channel:', `chat.${chatId}`);
    });

    this.echoChannel.error((err: any) => {
      console.error('❌ Echo channel error:', err);
    });

    // ✅ Listen once only
    this.echoChannel.stopListening('.message.sent');
    this.echoChannel.listen('.message.sent', (data: any) => {
      console.log('📩 Real-time message received:', data);
      this.zone.run(() => {
        const message = data.message;
        const exists = this.viewModel.messages.some(
          (m) => m.text === message.content && m.sender === message.sender.username
        );
        if (!exists) {
          this.viewModel.messages.push({
            sender: message.sender_id === currentUserId ? 'You' : message.sender.username,
            text: message.content,
            time: new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
          });
          setTimeout(() => this.scrollToBottom(), 100);
        }
      });
    });

    // ✅ Mark listener as active
    this.hasListener = true;

    console.log('👀 Active channels:', Object.keys(window.Echo.connector.channels));
  }


  /** Send typing whisper */
  onTyping() {
    if (this.echoChannel) {
      this.echoChannel.whisper('typing', {
        userId: this.getCurrentUserId(),
      });
    }
  }

  /** Send message */
  sendMessage() {
    if (!this.newMessage.trim()) return;

    const payload = { content: this.newMessage };
    const tempMessage = this.newMessage;
    this.newMessage = '';

    // Optimistic UI update
    const optimisticMsg = {
      sender: 'You',
      text: tempMessage,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    this.viewModel.messages.push(optimisticMsg);
    this.scrollToBottom();

    this.barterService.sendMessage(this.barterId, payload).subscribe({
      next: (res) => console.log('✅ Message sent:', res),
      error: (err) => {
        this.viewModel.messages.pop(); // rollback
        alert('Failed to send message: ' + err.message);
        this.newMessage = tempMessage;
      },
    });
  }

  /** Update barter status */
  updateStatus(newStatus: string) {
    const map: Record<string, string> = {
      Pending: 'proposed',
      Ongoing: 'accepted',
      Completed: 'completed',
      Cancelled: 'cancelled',
    };
    const backendStatus = map[newStatus] || newStatus;

    this.barterService.updateStatus(this.viewModel.id, backendStatus).subscribe({
      next: (res) => {
        this.viewModel.status = this.formatStatus(res.barter.status);
        alert('Status updated successfully');
      },
      error: (err) => alert(err.error?.message || 'Failed to update status'),
    });
  }

  /** Delete barter */
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

  /** Format barter for display */
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

    const myRole = barter.participants.find((p) => p.id === currentUserId)?.pivot?.role || 'offering';

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

  /** Get current user ID */
  private getCurrentUserId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('swapify_user') || '{}');
      return user?.id || 0;
    } catch {
      return 0;
    }
  }

  /** Format status for UI */
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

  ngOnDestroy() {
    if (this.echoChannel && this.barter?.chat?.id) {
      const chatId = this.barter.chat.id;
      window.Echo.leave(`chat.${chatId}`);
      console.log('🔌 Left chat channel:', chatId);
      this.echoChannel = null;
    }
    this.hasListener = false; // 🧹 reset listener flag
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.userSub?.unsubscribe();
  }


  /** Scroll chat to bottom */
  private scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.querySelector('.chat-box');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  }
}
