import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BarterService, Barter } from '../../services/barter';
import { EchoService } from '../../services/echo';
import { ReviewForm } from '../review-form/review-form';
import { Review } from '../../services/review';

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
  attachment_url?: string | null;
  isImage?: boolean;
}

interface BarterViewModel {
  id: number;
  partner: string;
  status: string;
  yourOffer: { title: string; image: string };
  partnerOffer: { title: string; image: string };
  messages: ChatMessage[];
  role: 'offering' | 'requesting';
}

@Component({
  selector: 'app-barter-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewForm],
  templateUrl: './barter-details.html',
  styleUrls: ['./barter-details.css'],
})
export class BarterDetails implements OnInit, OnDestroy {
  barterId!: number;
  barter!: Barter;
  viewModel!: BarterViewModel;
  newMessage = '';
  isLoading = true;
  hasReviewed = false;
  showReviewModal = true;

  private echoChannel: any;
  private typingTimeout: any;
  private reconnectTimeout: any;
  isPartnerTyping = false;

  // File upload
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  constructor(
    private route: ActivatedRoute,
    private barterService: BarterService,
    private router: Router,
    private zone: NgZone,
    private echoService: EchoService,
    private reviewService: Review
  ) {
    // Clean up Echo channel on route changes
    this.router.events.subscribe(() => {
      this.cleanupEcho();
    });
  }

  ngOnInit() {
    this.barterId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBarter();
  }

  ngOnDestroy() {
    this.cleanupEcho();
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
  }

  private cleanupEcho() {
    if (this.echoChannel && this.barter?.chat?.id) {
      try {
        window.Echo.leave(`private-chat.${this.barter.chat.id}`);
        console.log('🧹 Cleaned up Echo channel:', this.barter.chat.id);
      } catch (err) {
        console.error('Error cleaning up Echo:', err);
      }
      this.echoChannel = null;
    }
  }

  /** Load barter data from backend */
  private loadBarter() {
    this.isLoading = true;
    this.barterService.getBarter(this.barterId).subscribe({
      next: (barter) => {
        this.barter = barter;
        this.viewModel = this.formatBarter(barter);
        this.isLoading = false;

        // Initialize chat after data is loaded
        if (barter.chat?.id) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            this.subscribeToChat();
            this.scrollToBottom();
          }, 100);
        }

        // Check review status
        if (barter.status === 'completed') {
          this.reviewService.hasReviewed(this.barterId).subscribe({
            next: (res) => {
              this.hasReviewed = res.hasReviewed;
              this.showReviewModal = !res.hasReviewed;
            },
            error: () => {
              this.hasReviewed = false;
              this.showReviewModal = false;
            },
          });
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
    if (!this.barter?.chat?.id) {
      console.warn('⚠️ No chat ID available');
      return;
    }

    const token = localStorage.getItem('swapify_token');
    if (!token) {
      console.error('❌ No auth token found');
      return;
    }

    const chatId = this.barter.chat.id;
    const currentUserId = this.getCurrentUserId();

    // Clean up any existing subscription first
    this.cleanupEcho();

    // Ensure Echo is initialized
    if (!window.Echo) {
      console.error('❌ Echo not initialized');
      this.echoService.initEcho(token);
      // Retry after initialization
      setTimeout(() => this.subscribeToChat(), 500);
      return;
    }

    // Update auth headers dynamically
    if (window.Echo.connector?.options?.auth) {
      window.Echo.connector.options.auth.headers = {
        ...window.Echo.connector.options.auth.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    console.log('🔌 Subscribing to chat:', chatId);

    // Subscribe to private channel
    this.echoChannel = window.Echo.private(`chat.${chatId}`);

    // Handle channel errors
    this.echoChannel.error((err: any) => {
      console.error('❌ Echo channel error:', err);
      // Attempt reconnection after 3 seconds
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        this.subscribeToChat();
      }, 3000);
    });

    // Monitor connection state
    if (window.Echo.connector?.pusher?.connection) {
      window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected');
      });

      window.Echo.connector.pusher.connection.bind('disconnected', () => {
        console.warn('⚠️ Pusher disconnected');
      });

      window.Echo.connector.pusher.connection.bind('error', (err: any) => {
        console.error('❌ Pusher connection error:', err);
      });
    }

    // Listen for new messages
    this.echoChannel.listen('.message.sent', (data: any) => {
      console.log('📩 Real-time message received:', data);

      this.zone.run(() => {
        const message = data.message;

        // More lenient duplicate check - only check recent messages
        const recentMessages = this.viewModel.messages.slice(-10);
        const isDuplicate = recentMessages.some(
          (m) =>
            m.text === message.content &&
            m.sender === (message.sender_id === currentUserId ? 'You' : message.sender?.username) &&
            Math.abs(new Date(m.time).getTime() - new Date(message.created_at).getTime()) < 1000
        );

        if (!isDuplicate) {
          const attachmentUrl = message.attachment_url || null;
          const isImage = attachmentUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachmentUrl);

          this.viewModel.messages.push({
            sender: message.sender_id === currentUserId ? 'You' : message.sender?.username || 'Partner',
            text: message.content,
            time: new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
            attachment_url: attachmentUrl,
            isImage: !!isImage,
          });

          setTimeout(() => this.scrollToBottom(), 100);
        } else {
          console.log('⏭️ Skipped duplicate message');
        }
      });
    });

    // Typing whisper
    this.echoChannel.listenForWhisper('typing', (data: any) => {
      if (data.userId !== currentUserId) {
        this.zone.run(() => {
          this.isPartnerTyping = true;
          if (this.typingTimeout) clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.isPartnerTyping = false;
          }, 2000);
        });
      }
    });

    console.log('✅ Successfully subscribed to chat:', chatId);
  }

  /** Handle file selection */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('❌ Only images (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    if (file.size > maxSize) {
      alert('❌ File size must be less than 5MB');
      return;
    }

    this.selectedFile = file;
  }

  /** Send typing whisper */
  onTyping() {
    if (this.echoChannel) {
      try {
        this.echoChannel.whisper('typing', {
          userId: this.getCurrentUserId(),
        });
      } catch (err) {
        console.error('Error sending typing indicator:', err);
      }
    }
  }

  /** Send message */
  sendMessage() {
    if (!this.newMessage.trim() && !this.selectedFile) return;

    const payload: any = { content: this.newMessage || '📎 Attachment' };
    if (this.selectedFile) {
      payload.attachment = this.selectedFile;
      this.isUploading = true;
    }

    const tempMessage = this.newMessage;
    const tempFile = this.selectedFile;

    // Add optimistic message immediately
    const tempTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    this.viewModel.messages.push({
      sender: 'You',
      text: tempMessage || '📎 Attachment',
      time: tempTime,
      attachment_url: null,
      isImage: false,
    });

    this.newMessage = '';
    this.selectedFile = null;
    this.scrollToBottom();

    this.barterService.sendMessage(this.barterId, payload).subscribe({
      next: (res) => {
        this.isUploading = false;
        console.log('✅ Message sent:', res);

        // Update the last message with actual data
        const lastMsg = this.viewModel.messages[this.viewModel.messages.length - 1];
        const attachmentUrl = res.message.attachment_url || null;
        const isImage = attachmentUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachmentUrl);

        lastMsg.text = res.message.content;
        lastMsg.attachment_url = attachmentUrl;
        lastMsg.isImage = !!isImage;
        lastMsg.time = new Date(res.message.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
      },
      error: (err) => {
        this.isUploading = false;
        // Remove failed message
        this.viewModel.messages.pop();
        alert('Failed to send message: ' + err.message);
        this.newMessage = tempMessage;
        this.selectedFile = tempFile;
      },
    });
  }

  /** Update barter status */
  updateStatus(newStatus: string) {
    if (!this.viewModel) return;

    let finalStatus = newStatus;
    if (newStatus === 'Ongoing') {
      if (this.barter.exchange_type === 'in_person') {
        finalStatus = 'Completed';
      } else if (this.barter.exchange_type === 'delivery') {
        finalStatus = 'Ongoing';
      }
    }

    const map: Record<string, string> = {
      Pending: 'proposed',
      Ongoing: 'accepted',
      Completed: 'completed',
      Cancelled: 'cancelled',
    };
    const backendStatus = map[finalStatus] || finalStatus;

    this.barterService.updateStatus(this.viewModel.id, backendStatus).subscribe({
      next: (res) => {
        this.viewModel.status = this.formatStatus(res.barter.status);
        alert(`Status updated to ${this.viewModel.status}`);
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

    const messages =
      barter.chat?.messages.map((msg) => {
        const attachmentUrl = msg.attachment_url || null;
        const isImage = attachmentUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachmentUrl);

        return {
          sender:
            msg.sender_id === currentUserId
              ? 'You'
              : msg.sender?.username || partner?.username || 'Partner',
          text: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          attachment_url: attachmentUrl,
          isImage: !!isImage,
        };
      }) || [];

    const myListing = barter.listings.find((l) => l.pivot?.owner_user_id === currentUserId);
    const theirListing = barter.listings.find((l) => l.pivot?.owner_user_id !== currentUserId);

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

  /** Helpers */
  private getCurrentUserId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('swapify_user') || '{}');
      return user?.id || 0;
    } catch {
      return 0;
    }
  }

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

  private scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.querySelector('.chat-box');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  }

  getOtherUserId(): number | null {
    const currentUserId = this.getCurrentUserId();
    const otherParticipant = this.barter.participants.find((p) => p.id !== currentUserId);
    return otherParticipant ? otherParticipant.id : null;
  }

  get otherUserId(): number | null {
    return this.getOtherUserId();
  }

  closeReviewModal() {
    this.showReviewModal = false;
  }

  onReviewSubmitted() {
    this.showReviewModal = false;
    this.hasReviewed = true;
  }
}
