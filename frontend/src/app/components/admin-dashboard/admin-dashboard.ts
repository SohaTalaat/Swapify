import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdVerification } from '../../services/id-verification';
declare var bootstrap: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard {
  activeSection = 'overview';
  verifications: any[] = [];
  users = [
    { id: 1, name: 'Ali Hassan', email: 'ali@example.com', status: 'Active' },
    { id: 2, name: 'Sara Ahmed', email: 'sara@example.com', status: 'Banned' },
  ];
  reports = [
    { id: 1, content: 'Offensive image in offer #2', reporter: 'User 12' },
    { id: 2, content: 'Spam post in barter section', reporter: 'User 45' },
  ];
  offers = [
    { id: 1, title: 'Logo Design', category: 'Service', status: 'Active', user: 'Ali Hassan' },
    { id: 2, title: 'Used iPhone', category: 'Product', status: 'Pending', user: 'Sara Ahmed' },
  ];

  shipments = [
    { id: 1, item: 'Bluetooth Speaker', user: 'Ali Hassan', status: 'Shipped' },
    { id: 2, item: 'Laptop Bag', user: 'Sara Ahmed', status: 'Pending' },
  ];
  loading = false;

  constructor(private idService: IdVerification) {}

  ngOnInit() {
    this.loadVerifications();
  }

  setSection(section: string) {
    this.activeSection = section;
    if (section === 'verification') {
      this.loadVerifications();
    }
  }

  loadVerifications() {
    this.loading = true;
    this.idService.getAllVerifications().subscribe({
      next: (res: any) => {
        this.verifications = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load verifications', err);
        this.loading = false;
      },
    });
  }

  approve(v: any) {
    this.idService.approve(v.id).subscribe({
      next: () => (v.status = 'verified'),
      error: (err) => console.error(err),
    });
  }

  reject(v: any) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    this.idService.reject(v.id, reason).subscribe({
      next: () => {
        v.status = 'rejected';
        v.rejection_reason = reason;
      },
      error: (err) => console.error(err),
    });
  }
  toggleUserStatus(u: any) {
    u.status = u.status === 'Active' ? 'Banned' : 'Active';
  }
  fullscreenImg: string = '';

  openFullscreen(url: string) {
    this.fullscreenImg = url;
    // فتح المودال
    const modalElement = document.getElementById('fullscreenModal');
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();
  }
}
