import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Profile } from '../../services/profile';
import { firstValueFrom } from 'rxjs';
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
  email = localStorage.getItem('email') || '';
  profilePicture: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router, private profileService: Profile) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profilePicture = file;

      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
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

    try {
      await firstValueFrom(this.profileService.completeProfile(formData));
      if (this.profilePicture) {
        await firstValueFrom(this.profileService.uploadProfilePicture(this.profilePicture));
      }
      alert('Profile completed successfully!');
      this.router.navigate(['/profile']);
    } catch (err: any) {
      console.error(err);
      const msg = err?.error?.error || 'Something went wrong';
      alert(msg);
    }

  }
}
