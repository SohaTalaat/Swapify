import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Profile } from '../../services/profile';
@Component({
  selector: 'app-complete-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.css',
})
export class CompleteProfile {
  full_name = '';
  phone = '';
  city = '';
  bio = '';
  email = localStorage.getItem('email') || ''; // خده من التسجيل السابق
  profilePicture: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router, private profileService: Profile) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profilePicture = file;

      // للعرض فقط (Preview)
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.full_name || !this.phone || !this.city || !this.bio) {
      alert('Please complete all fields!');
      return;
    }

    const formData = new FormData();
    formData.append('email', this.email);
    formData.append('full_name', this.full_name);
    formData.append('phone', this.phone);
    formData.append('location', this.city);
    formData.append('bio', this.bio);

    if (this.profilePicture) {
      formData.append('profile_picture', this.profilePicture);
    }

    this.profileService.completeProfile(formData).subscribe({
      next: (res) => {
        alert('Profile completed successfully!');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error(err);
        alert('Something went wrong!');
      },
    });
  }
}
