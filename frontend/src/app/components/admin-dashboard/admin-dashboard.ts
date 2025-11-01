import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard {
  activeSection = 'overview';

  users = [
    { id: 1, name: 'Ali Hassan', email: 'ali@example.com', status: 'Active' },
    { id: 2, name: 'Sara Ahmed', email: 'sara@example.com', status: 'Banned' },
    { id: 3, name: 'Omar Said', email: 'omar@example.com', status: 'Active' },
  ];

  offers = [
    { id: 1, title: 'Logo Design', category: 'Service', status: 'Active', user: 'Ali Hassan' },
    { id: 2, title: 'Used iPhone', category: 'Product', status: 'Pending', user: 'Sara Ahmed' },
  ];

  reports = [
    { id: 1, content: 'Offensive image in offer #2', reporter: 'User 12' },
    { id: 2, content: 'Spam post in barter section', reporter: 'User 45' },
  ];

  verifications = [
    { id: 1, user: 'Omar Said', idImage: 'assets/id-sample.jpg', status: 'Pending' },
  ];

  shipments = [
    { id: 1, item: 'Bluetooth Speaker', user: 'Ali Hassan', status: 'Shipped' },
    { id: 2, item: 'Laptop Bag', user: 'Sara Ahmed', status: 'Pending' },
  ];

  setSection(section: string) {
    this.activeSection = section;
  }

  toggleUserStatus(user: any) {
    user.status = user.status === 'Active' ? 'Banned' : 'Active';
  }

  approveVerification(item: any) {
    item.status = 'Approved';
  }

  rejectVerification(item: any) {
    item.status = 'Rejected';
  }
}
