import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../../services/profile';
@Component({
  selector: 'app-profile-page',
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  userData: any = {};
  loading = true;

  constructor(private profileService: Profile) { }

  ngOnInit() {
    const email = localStorage.getItem('email');
    if (email) {
      this.profileService.getProfile(email).subscribe({
        next: (res: any) => {
          console.log(res)
          this.userData = res.data ?? res;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
    }
  }
}
