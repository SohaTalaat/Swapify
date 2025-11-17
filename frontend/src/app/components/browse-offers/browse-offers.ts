import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Offer } from '../../services/offer';
import { Recommendations } from '../recommendations/recommendations';
@Component({
  selector: 'app-browse-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, Recommendations],
  templateUrl: './browse-offers.html',
  styleUrls: ['./browse-offers.css'],
})
export class BrowseOffers {
  offers: any[] = [];
  selectedCategory = 'All';
  searchTerm = '';
  loading = true;

  constructor(private router: Router, private offerService: Offer) {}

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.offerService.getAll().subscribe({
      next: (res: any) => {
        console.log('✅ Response from API:', res); // 👈 شوّف في console
        this.offers = res.map((offer: any) => ({
          id: offer.id,
          title: offer.title,
          category: offer.category?.name || 'Uncategorized',
          location: offer.availability_info || 'Unknown', // 👈 مفيش location في البيانات، استخدم availability_info أو type
          image: offer.images?.[0]?.image_url || 'assets/no-image.png',
          want: offer.desired_in_return || 'Not specified', // 👈 اسم الحقل الحقيقي من الـ API
          user: offer.user?.username || 'Anonymous',
        }));
        console.log('🎯 Parsed Offers:', this.offers);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading offers:', err);
        this.loading = false;
      },
    });
  }

  get filteredOffers() {
    return this.offers.filter((o) => {
      const matchesCategory =
        this.selectedCategory === 'All' || o.category === this.selectedCategory;
      const matchesSearch = o.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  viewOffer(id: number) {
    this.router.navigate(['/offer-details', id]);
  }
}
