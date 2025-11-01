import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-create-offer',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-offer.html',
  styleUrl: './create-offer.css',
})
export class CreateOffer {
  offer = {
    title: '',
    description: '',
    category: '',
    type: 'Product',
    want: '',
  };

  onSubmit() {
    console.log('Offer Created:', this.offer);
    alert('Your offer has been created successfully!');
  }
}
