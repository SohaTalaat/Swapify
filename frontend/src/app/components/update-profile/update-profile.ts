import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Profile } from '../../services/profile';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth'; // ✅ import Auth service

@Component({
  selector: 'app-update-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css',
})
export class UpdateProfile implements OnInit {
  full_name = '';
  phone = '';
  location = '';
  bio = '';
  email = localStorage.getItem('email') || '';
  imagePreview: string | ArrayBuffer | null = null;
  profilePicture: File | null = null;

  constructor(
    private profileService: Profile,
    private router: Router,
    private auth: Auth // ✅ inject Auth
  ) {}

  async ngOnInit() {
    try {
      const response: any = await firstValueFrom(this.profileService.getProfile2());
      const user = response.user || response;

      this.full_name = user.full_name || '';
      this.phone = user.phone || '';
      this.location = user.location || '';
      this.bio = user.bio || '';
      this.imagePreview = user.profile_picture_url || null;
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

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
    try {
      let updatedUser: any = null;

      // ⬅️ أولاً: لو في صورة جديدة، ارفعها
      if (this.profilePicture) {
        const uploadRes = await firstValueFrom(
          this.profileService.uploadProfilePicture(this.profilePicture)
        );
        updatedUser = uploadRes.user; // تأكد أن الـ API بيرجع user بعد الرفع
      }

      // ⬅️ ثانيًا: حدّث باقي البيانات
      const formData = new FormData();
      if (this.full_name) formData.append('full_name', this.full_name);
      if (this.phone) formData.append('phone', this.phone);
      if (this.location) formData.append('location', this.location);
      if (this.bio) formData.append('bio', this.bio);

      const updateRes: any = await firstValueFrom(this.profileService.updateProfile(formData));
      updatedUser = updateRes.user || updatedUser;

      // ✅ ثالثًا: حدّث البيانات في Auth service عشان الهيدر يتحدث
      if (updatedUser) {
        this.auth.updateUserData({
          username: updatedUser.username,
          profile_picture_url: updatedUser.profile_picture_url,
        });
      }

      alert('✅ Profile updated successfully!');
      this.router.navigate(['/profile']);
    } catch (err: any) {
      console.error(err);
      alert(err?.error?.message || 'Something went wrong');
    }
  }
}
