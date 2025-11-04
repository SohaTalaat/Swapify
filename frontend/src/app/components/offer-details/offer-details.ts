import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Offer } from '../../services/offer';

@Component({
  selector: 'app-offer-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './offer-details.html',
  styleUrl: './offer-details.css',
})
export class OfferDetails {
  offer: any = null;
  loading = true;
  offerId!: number;

  constructor(private route: ActivatedRoute, private offerService: Offer) {}

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOffer();
  }

  /** ✅ جلب تفاصيل العرض من API */
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
      error: (err) => {
        console.error('❌ Error loading offer:', err);
        this.loading = false;
      },
    });
  }
}
