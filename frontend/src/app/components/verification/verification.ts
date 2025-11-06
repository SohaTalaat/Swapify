import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdVerification } from '../../services/id-verification'; // ✅ الصحيح

@Component({
  selector: 'app-verification',
  imports: [CommonModule, FormsModule],
  templateUrl: './verification.html',
  styleUrl: './verification.css',
})
export class Verification implements OnInit {
  idDocumentFile: File | null = null;
  selfieFile: File | null = null;
  idDocumentPreview: string | null = null;
  selfiePreview: string | null = null;

  status = '';
  rejectionReason = '';
  loading = false;
  message = '';

  constructor(private idService: IdVerification) {}

  ngOnInit() {
    this.loadStatus();
  }

  onFileChange(event: any, type: 'id' | 'selfie') {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'id') {
      this.idDocumentFile = file;
      this.idDocumentPreview = URL.createObjectURL(file); // ✅ generate preview
    } else {
      this.selfieFile = file;
      this.selfiePreview = URL.createObjectURL(file); // ✅ generate preview
    }
  }

  loadStatus() {
    this.idService.getStatus().subscribe({
      next: (res: any) => {
        this.status = res.status;
        this.rejectionReason = res.rejection_reason;
      },
      error: (err) => console.error('Failed to load status', err),
    });
  }

  submit() {
    if (!this.idDocumentFile || !this.selfieFile) {
      alert('Please upload both ID document and selfie.');
      return;
    }

    this.loading = true;
    this.idService.submitVerification(this.idDocumentFile, this.selfieFile).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Verification submitted successfully';
        this.status = 'pending';
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Submission failed';
        this.loading = false;
      },
    });
  }
}
