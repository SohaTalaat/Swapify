import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../../services/profile';
import { RouterLink } from '@angular/router';
import { MyOffers } from '../my-offers/my-offers';
@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, RouterLink, MyOffers],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  userData: any = {};
  loading = true;

  constructor(private profileService: Profile) {}

  ngOnInit() {
    const email = localStorage.getItem('email');
    if (email) {
      this.profileService.getProfile(email).subscribe({
        next: (res: any) => {
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
