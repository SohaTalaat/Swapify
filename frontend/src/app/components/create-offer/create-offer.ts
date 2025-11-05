import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Offer } from '../../services/offer';

@Component({
  selector: 'app-create-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-offer.html',
  styleUrls: ['./create-offer.css'],
})
export class CreateOffer {
  offer = {
    category_id: '',
    title: '',
    description: '',
    type: 'product',
    condition: '',
    availability_info: '',
    desired_in_return: '',
    images: [] as File[],
  };

  previewUrls: string[] = [];
  loading = false;

  constructor(private offerService: Offer) {}

  /** ✅ عند اختيار صور */
  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.offer.images = files;

    // عرض الصور المختارة (Preview)
    this.previewUrls = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  /** ✅ عند إرسال النموذج */
  onSubmit() {
    if (!this.offer.category_id) {
      alert('Please select a category');
      return;
    }

    this.loading = true;

    console.log('🟡 Sending Offer:', this.offer);

    this.offerService.create(this.offer).subscribe({
      next: (res) => {
        console.log('✅ Offer Created:', res);
        alert('Offer created successfully!');
        this.resetForm();
      },
      error: (err) => {
        console.error('❌ Error:', err);
        alert('Error creating offer. Check console for details.');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /** ✅ إعادة تعيين النموذج */
  resetForm() {
    this.offer = {
      category_id: '',
      title: '',
      description: '',
      type: 'product',
      condition: '',
      availability_info: '',
      desired_in_return: '',
      images: [],
    };
    this.previewUrls = [];
  }
}
