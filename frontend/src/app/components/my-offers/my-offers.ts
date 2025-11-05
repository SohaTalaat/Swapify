import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Offer } from '../../services/offer';
@Component({
  selector: 'app-my-offers',
  imports: [CommonModule],
  templateUrl: './my-offers.html',
  styleUrl: './my-offers.css',
})
export class MyOffers {
  offers: any[] = [];
  loading = true;

  constructor(private router: Router, private offerService: Offer) {}

  ngOnInit() {
    this.loadMyOffers();
  }

  /** ✅ تحميل العروض الخاصة بالمستخدم */
  loadMyOffers() {
    this.offerService.getMyOffers().subscribe({
      next: (res: any[]) => {
        console.log('✅ My Offers:', res);
        this.offers = res.map((o) => ({
          id: o.id,
          title: o.title,
          type: o.type === 'product' ? 'Product' : 'Service',
          status: o.status || 'Active',
          image: o.images?.[0]?.image_url || 'assets/no-image.png',
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading offers:', err);
        this.loading = false;
      },
    });
  }

  createOffer() {
    this.router.navigate(['/create-offer']);
  }

  editOffer(id: number) {
    this.router.navigate(['/edit-offer', id]);
  }
  deleteOffer(id: number) {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(id).subscribe({
        next: (res: any) => {
          console.log('✅ Offer deleted:', res);
          // حذف العنصر من المصفوفة بدون إعادة تحميل الصفحة
          this.offers = this.offers.filter((o) => o.id !== id);
        },
        error: (err) => {
          console.error('❌ Error deleting offer:', err);
        },
      });
    }
  }
}
