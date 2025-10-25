import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-complete-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.css',
})
export class CompleteProfile {
  username = '';
  city = '';
  bio = '';
  profilePicture: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profilePicture = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.username || !this.city || !this.bio) {
      alert('Please complete all fields!');
      return;
    }

    // 🔹 هنا المفروض تبعت البيانات للسيرفر (API)
    console.log({
      username: this.username,
      city: this.city,
      bio: this.bio,
      profilePicture: this.profilePicture,
    });

    alert('Profile completed successfully!');
    this.router.navigate(['/home']);
  }
}
