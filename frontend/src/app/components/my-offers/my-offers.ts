import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-my-offers',
  imports: [CommonModule],
  templateUrl: './my-offers.html',
  styleUrl: './my-offers.css',
})
export class MyOffers {
  constructor(private router: Router) {}

  offers = [
    {
      id: 1,
      title: 'Logo Design Service',
      type: 'Service',
      status: 'Active',
      image: 'https://cdn-icons-png.flaticon.com/512/1838/1838419.png',
    },
    {
      id: 2,
      title: 'Used Laptop Dell',
      type: 'Product',
      status: 'Pending',
      image: 'https://cdn-icons-png.flaticon.com/512/906/906343.png',
    },
  ];

  createOffer() {
    this.router.navigate(['/create-offer']);
  }

  editOffer(id: number) {
    this.router.navigate(['/edit-offer', id]);
  }
}
