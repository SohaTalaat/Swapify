import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Offer } from '../../services/offer';
import { Report } from '../../services/report';

@Component({
  selector: 'app-offer-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './offer-details.html',
  styleUrl: './offer-details.css',
})
export class OfferDetails implements OnInit {
  offer: any = null;
  loading = true;
  offerId!: number;

  showReportForm = false; // للتحكم في إظهار/إخفاء النموذج
  reportReason = ''; // لتخزين سبب الإبلاغ

  constructor(
    private route: ActivatedRoute,
    private offerService: Offer,
    private reportService: Report
  ) {}

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOffer();
  }

  /** جلب تفاصيل العرض من API */
  loadOffer() {
    this.offerService.getOne(this.offerId).subscribe({
      next: (res: any) => {
        console.log('✅ Offer details:', res);
        this.offer = {
          title: res.title,
          user: res.user?.username || 'Anonymous',
          category: res.category?.name || 'Uncategorized',
          location: res.availability_info || 'Unknown',
          description: res.description,
          want: res.desired_in_return || 'Not specified',
          image: res.images?.[0]?.image_url || 'assets/no-image.png',
        };
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Error loading offer:', err);
        this.loading = false;
      },
    });
  }

  /** إرسال التقرير للـ Admin */
  submitReport() {
    if (!this.reportReason.trim()) return alert('Please enter a reason.');

    this.reportService.submitReport(this.offerId, this.reportReason).subscribe({
      next: (res: any) => {
        alert('Report submitted successfully.');
        this.showReportForm = false; // إخفاء النموذج بعد الإرسال
        this.reportReason = ''; // مسح النص
      },
      error: (err: any) => {
        console.error('Error submitting report:', err);
        alert('Failed to submit report.');
      },
    });
  }
}
