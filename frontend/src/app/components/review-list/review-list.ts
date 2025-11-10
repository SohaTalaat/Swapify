import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../services/review';

interface ReviewItem {
  reviewer: string;
  avatar: string; // ✅ أضف هذه الخاصية

  rating: number;
  comment: string;
  created_at: string;
}

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-list.html',
  styleUrls: ['./review-list.css'],
})
export class ReviewList implements OnInit {
  reviews: ReviewItem[] = [];
  averageRating = 0;
  Math = Math;

  constructor(private reviewService: Review) {}

  ngOnInit() {
    this.loadReviews();
  }

  /** احصل على الـ current user ID من localStorage */
  getCurrentUserId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('swapify_user') || '{}');
      return user?.id || 0;
    } catch {
      return 0;
    }
  }

  loadReviews() {
    const currentUserId = this.getCurrentUserId();

    this.reviewService.getUserReviews().subscribe({
      next: (res: any) => {
        console.log('API reviews:', res);

        // فلتر على الريفيوهات المستلمة فقط
        this.reviews = res.received
          .filter((r: any) => r.reviewee_id === currentUserId)
          .map((r: any) => ({
            reviewer: r.reviewer?.username || `User #${r.reviewer_id}`,
            avatar: r.reviewer?.profile_picture_url || 'assets/avatar.png', // صورة افتراضية إذا لا توجد
            rating: r.rating,
            comment: r.comment || '',
            created_at: r.created_at || new Date().toISOString(),
          }));

        if (this.reviews.length) {
          this.averageRating =
            this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
        }
      },
      error: (err) => console.error('Failed to load reviews', err),
    });
  }

  trackByIndex(index: number) {
    return index;
  }
}
