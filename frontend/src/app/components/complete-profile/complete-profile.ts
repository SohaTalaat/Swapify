import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Profile } from '../../services/profile';
import { Auth } from '../../services/auth';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private profileService: Profile,
    private auth: Auth // ✅ أضفنا خدمة الـ Auth هنا
  ) {}

  ngOnInit() {
    // ✅ حفظ التوكن القادم من رابط التفعيل
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (token) {
      localStorage.setItem('swapify_token', token);
      this.auth.setToken(token); // ✅ تحديث حالة تسجيل الدخول فورًا
    }

    if (email) {
      localStorage.setItem('email', email);
      this.email = email;
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
      const res = await firstValueFrom(this.profileService.completeProfile(formData));

      if (this.profilePicture) {
        await firstValueFrom(this.profileService.uploadProfilePicture(this.profilePicture));
      }

      // ✅ تحديث بيانات المستخدم في Auth
      this.auth.setUserData({
        username: this.full_name,
        profile_picture_url: this.imagePreview || 'assets/avatar.png',
        email: this.email,
        role: 'user',
      });

      alert('Profile completed successfully! 🎉');

      // ✅ إعادة التوجيه إلى الصفحة الرئيسية
      this.router.navigate(['/']);
    } catch (err: any) {
      console.error(err);
      const msg = err?.error?.error || 'Something went wrong';
      alert(msg);
    }
  }
}
