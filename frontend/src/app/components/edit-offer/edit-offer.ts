import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Offer } from '../../services/offer';
import { FileUpload } from '../../services/file-upload';

@Component({
  selector: 'app-edit-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-offer.html',
  styleUrls: ['./edit-offer.css'],
})
export class EditOffer implements OnInit {
  offerId!: number;
  categories: any[] = [];
  offer: any = {
    title: '',
    description: '',
    category_id: '',
    type: 'product',
    want: '',
  };
  previewImages: string[] = [];
  newImages: File[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: Offer,
    private fileUpload: FileUpload
  ) {}

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategories();
    this.loadOffer();
  }

  /** تحميل التصنيفات */
  loadCategories() {
    this.offerService.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error(err),
    });
  }

  /** تحميل بيانات العرض */
  loadOffer() {
    this.offerService.getOne(this.offerId).subscribe({
      next: (res) => {
        this.offer = {
          title: res.title,
          description: res.description,
          category_id: res.category_id,
          type: res.type,
          want: res.want || res.desired_in_return,
        };
        this.previewImages = res.images?.map((img: any) => img.image_url) || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading offer:', err);
        alert('حدث خطأ أثناء تحميل بيانات العرض');
        this.loading = false;
      },
    });
  }

  /** ✅ رفع صورة جديدة على Cloudinary */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.offerId) return;

    this.fileUpload.uploadListingImage(this.offerId, file).subscribe({
      next: (res) => {
        console.log('✅ تم رفع الصورة بنجاح:', res);
        this.previewImages.push(res.image.image_url);
        alert('✅ تم رفع الصورة بنجاح!');
      },
      error: (err) => {
        console.error('❌ فشل الرفع:', err);
        alert('حدث خطأ أثناء رفع الصورة');
      },
    });
  }

  /** ✅ حفظ التعديلات */
  saveChanges() {
    this.offerService.update(this.offerId, this.offer, []).subscribe({
      next: (res) => {
        console.log('✅ Offer updated:', res);
        alert('✅ تم تحديث العرض بنجاح!');
        this.router.navigate(['/my-offers']);
      },
      error: (err) => {
        console.error('❌ Update failed:', err);
        alert('حدث خطأ أثناء تحديث العرض');
      },
    });
  }
}
