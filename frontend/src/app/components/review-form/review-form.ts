import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review } from '../../services/review';
@Component({
  selector: 'app-review-form',
  imports: [CommonModule, FormsModule], // ✅ أضف دول
  templateUrl: './review-form.html',
  styleUrl: './review-form.css',
})
export class ReviewForm {
  @Input() barterId!: number;
  @Input() revieweeId!: number;
  @Output() reviewSubmitted = new EventEmitter<void>(); // ✅ حدث جديد

  rating = 0;
  comment = '';
  stars = [1, 2, 3, 4, 5];
  ratingHover = 0;
  hoverBtn = false;
  isSubmitted = false; // ✅ متغير جديد للتحكم بالإخفاء

  constructor(private reviewService: Review) {}

  setRating(value: number) {
    this.rating = value;
  }

  submitReview() {
    const payload = {
      barter_id: this.barterId,
      reviewee_id: this.revieweeId,
      rating: this.rating,
      comment: this.comment,
    };

    this.reviewService.createReview(payload).subscribe({
      next: (res) => {
        alert('✅ Review submitted successfully');
        this.isSubmitted = true; // ✅ أخفي الفورم بعد الإرسال
        this.reviewSubmitted.emit(); // 🔔 إخطار المكون الأب
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to submit review');
      },
    });
  }
}
