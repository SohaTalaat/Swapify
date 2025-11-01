import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-offer-details',
  imports: [CommonModule],
  templateUrl: './offer-details.html',
  styleUrl: './offer-details.css',
})
export class OfferDetails {
  offer = {
    title: 'Logo Design Service',
    user: 'Ahmed Hassan',
    category: 'Service',
    location: 'Cairo, Egypt',
    description:
      'I will design a professional, modern logo tailored to your brand identity. Includes 3 revisions.',
    want: 'Content Writing Service',
    image: 'assets/offers/design.jpg',
    rating: 4.8,
  };
  offerId: number | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Opened Offer ID:', this.offerId);
  }
}
