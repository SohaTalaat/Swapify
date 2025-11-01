import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-my-barters',
  imports: [CommonModule],
  templateUrl: './my-barters.html',
  styleUrl: './my-barters.css',
})
export class MyBarters {
  constructor(private router: Router) {}

  barters = [
    { id: 1, title: 'Logo Design ↔ Content Writing', partner: 'Sara Ahmed', status: 'Ongoing' },
    {
      id: 2,
      title: 'Used iPhone ↔ Bluetooth Headphones',
      partner: 'Omar Youssef',
      status: 'Completed',
    },
  ];

  viewDetails(id: number) {
    this.router.navigate(['/barter-details', id]);
  }
}
