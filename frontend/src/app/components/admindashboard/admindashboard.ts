


import { Component, OnInit } from '@angular/core';

import { AdminService } from '../../services/admin';

@Component({

  selector: 'app-admindashboard',

  templateUrl: './admindashboard.html',

  styleUrls: ['./admindashboard.css']

})

export class Admindashboard implements OnInit {

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

  constructor(private adminService: AdminService) {}

  ngOnInit() {

    this.loadOverview();

  }

  setSection(section: string) {

    this.activeSection = section;

    if (section === 'users') {

      this.loadUsers();

    } else if (section === 'offers') {

      this.loadOffers();

    } else if (section === 'content') {

      this.loadReports();

    } else if (section === 'verification') {

      this.loadVerifications();

    } else if (section === 'shipping') {

      this.loadShipments();

    }

  }

  loadOverview() {

    this.adminService.getOverview().subscribe(data => {

      // Handle overview data if needed

      // For now, your static data is used

    });

  }

  loadUsers() {

    this.adminService.getUsers().subscribe(data => {

      this.users = data;

    });

  }

  toggleUserStatus(user: any) {

    if (user.status === 'Active') {

      this.adminService.banUser(user.id).subscribe(() => {

        user.status = 'Banned';

      });

    } else {

      this.adminService.activateUser(user.id).subscribe(() => {

        user.status = 'Active';

      });

    }

  }

  loadOffers() {

    this.adminService.getListings().subscribe(data => {

      this.offers = data;

    });

  }

  loadReports() {

    this.adminService.getReports().subscribe(data => {

      this.reports = data;

    });

  }

  removeReport(report: any) {

    this.adminService.removeReport(report.id).subscribe(() => {

      this.reports = this.reports.filter(r => r.id !== report.id);

    });

  }

  loadVerifications() {

    // Your existing data for verifications

    // Possibly fetch from API if needed

  }

  approveVerification(verification: any) {

    this.adminService.approveVerification(verification.id).subscribe(() => {

      verification.status = 'Approved';

    });

  }

  rejectVerification(verification: any) {

    this.adminService.rejectVerification(verification.id).subscribe(() => {

      verification.status = 'Rejected';

    });

  }

  loadShipments() {

    this.adminService.getShipments().subscribe(data => {

      this.shipments = data;

    });

  }

}
















