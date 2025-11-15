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
  temp?: boolean;
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
  isPartnerTyping = false;

  // File upload
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  // Dispute properties
  showDisputeModal = false;
  disputeReason = '';
  disputeDescription = '';
  isSubmittingDispute = false;

  // Cancel modal
  showCancelBox = false;
  cancelReason = '';

  constructor(
    private route: ActivatedRoute,
    private barterService: BarterService,
    private router: Router,
    private zone: NgZone,
    private echoService: EchoService,
    private reviewService: Review
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
    this.barterId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBarter();
  }

  ngOnDestroy() {
    if (this.echoChannel) {
      console.log('🔌 Left chat channel:', this.barter?.chat?.id);
      window.Echo.leave(`chat.${this.barter?.chat?.id}`);
      this.echoChannel = null;
    }
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  private loadBarter() {
    this.isLoading = true;
    this.barterService.getBarter(this.barterId).subscribe({
      next: (barter) => {
        this.barter = barter;
        this.viewModel = this.formatBarter(barter);
        this.isLoading = false;

        if (barter.chat?.id) this.subscribeToChat();

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

  private subscribeToChat() {
    if (!this.barter?.chat?.id) return;

    const chatId = this.barter.chat.id;
    const currentUserId = this.getCurrentUserId();

    this.echoChannel = window.Echo.private(`chat.${chatId}`);

    // ✅ FIX: Listen for new messages
    this.echoChannel.listen('.message.sent', (data: any) => {
      console.log('📩 Real-time message received:', data);

      this.zone.run(() => {
        const message = data.message;

        // If from current user, replace temp message
        if (message.sender_id === currentUserId) {
          const tempIndex = this.viewModel.messages.findIndex((m) => m.temp);
          if (tempIndex !== -1) {
            this.viewModel.messages[tempIndex] = {
              sender: 'You',
              text: message.content,
              time: new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              }),
              attachment_url: message.attachment_url,
              isImage: /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(message.attachment_url || ''),
            };
            return;
          }
        }

        // If from partner, add new message
        const exists = this.viewModel.messages.some(
          (m) =>
            m.text === message.content &&
            m.sender === message.sender.username &&
            m.attachment_url === message.attachment_url
        );
        if (exists) return;

        const attachmentUrl = message.attachment_url || null;
        const isImage = attachmentUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachmentUrl);

        this.viewModel.messages.push({
          sender: message.sender_id === currentUserId ? 'You' : message.sender.username,
          text: message.content,
          time: new Date(message.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          attachment_url: attachmentUrl,
          isImage: !!isImage,
        });

        setTimeout(() => this.scrollToBottom(), 100);
      });
    });

    // ✅ FIX: Listen for typing whisper
    this.echoChannel.listenForWhisper('typing', (data: any) => {
      console.log('⌨️ Typing whisper received:', data);
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

    window.Echo.connector.pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected');
    });
    window.Echo.connector.pusher.connection.bind('disconnected', () => {
      console.warn('⚠️ Pusher disconnected');
    });
    this.echoChannel.error((err: any) => console.error('❌ Echo channel error:', err));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

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

  onTyping() {
    if (this.echoChannel) {
      this.echoChannel.whisper('typing', {
        userId: this.getCurrentUserId(),
      });
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() && !this.selectedFile) return;

    const payload: any = { content: this.newMessage || '📎 Attachment (reload page to see)' };
    if (this.selectedFile) {
      payload.attachment = this.selectedFile;
      this.isUploading = true;
    }

    const tempMessage = this.newMessage;
    const tempFile = this.selectedFile;

    const tempTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    // ✅ Add temp message
    const tempMsg = {
      sender: 'You',
      text: tempMessage || '📎 Attachment',
      time: tempTime,
      attachment_url: null,
      isImage: false,
      temp: true,
    };
    this.viewModel.messages.push(tempMsg);
    this.newMessage = '';
    this.selectedFile = null;
    this.scrollToBottom();

    this.barterService.sendMessage(this.barterId, payload).subscribe({
      next: (res) => {
        this.isUploading = false;
        console.log('✅ Message sent:', res);

        // ✅ Replace temp message with real data
        const tempIndex = this.viewModel.messages.findIndex((m) => m.temp);
        if (tempIndex !== -1) {
          this.viewModel.messages[tempIndex] = {
            sender: 'You',
            text: res.message.content,
            time: new Date(res.message.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
            attachment_url: res.message.attachment_url,
            isImage: /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(res.message.attachment_url || ''),
          };
        }
      },
      error: (err) => {
        this.isUploading = false;
        const tempIndex = this.viewModel.messages.findIndex((m) => m.temp);
        if (tempIndex !== -1) this.viewModel.messages.splice(tempIndex, 1);
        alert('Failed to send message: ' + err.message);
        this.newMessage = tempMessage;
        this.selectedFile = tempFile;
      },
    });
  }

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
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
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

  openCancelBox() {
    this.showCancelBox = true;
  }

  closeCancelBox() {
    this.showCancelBox = false;
    this.cancelReason = '';
  }

  confirmCancel() {
    if (!this.cancelReason.trim()) {
      alert('Please enter a reason for cancellation.');
      return;
    }

    const token = localStorage.getItem('swapify_token');
    if (!token) {
      alert('Not authenticated');
      return;
    }

    this.barterService.cancelBarter(this.viewModel.id, this.cancelReason).subscribe({
      next: () => {
        alert('Barter cancelled successfully.');
        this.closeCancelBox();
        this.router.navigate(['/my-barters']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to cancel barter');
      },
    });
  }

  openDisputeModal() {
    this.showDisputeModal = true;
    this.disputeReason = '';
    this.disputeDescription = '';
  }

  closeDisputeModal() {
    this.showDisputeModal = false;
    this.disputeReason = '';
    this.disputeDescription = '';
    this.isSubmittingDispute = false;
  }

  submitDispute() {
    if (!this.disputeReason.trim() || !this.disputeDescription.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.disputeDescription.length > 500) {
      alert('Description must be 500 characters or less.');
      return;
    }

    this.isSubmittingDispute = true;

    this.barterService
      .createDispute(this.barterId, this.disputeReason, this.disputeDescription)
      .subscribe({
        next: (res) => {
          alert('Dispute created successfully. An admin will review it shortly.');
          this.closeDisputeModal();
          this.isSubmittingDispute = false;
          this.loadBarter();
        },
        error: (err) => {
          console.error('Error creating dispute:', err);
          alert(err.message || 'Failed to create dispute. Please try again.');
          this.isSubmittingDispute = false;
        },
      });
  }
}
