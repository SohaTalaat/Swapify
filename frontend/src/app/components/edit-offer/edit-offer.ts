import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-edit-offer',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-offer.html',
  styleUrl: './edit-offer.css',
})
export class EditOffer {
  offerId: number | null = null;
  offer = {
    title: 'Used Laptop Dell',
    description: 'Slightly used laptop, works great for freelancers.',
    category: 'Product',
    type: 'Product',
    want: 'Smartwatch',
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Editing offer:', this.offerId);
  }

  saveChanges() {
    console.log('Updated Offer:', this.offer);
    alert('Offer updated successfully!');
  }
}
