import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdVerification } from '../../services/id-verification';
import { AdminReport } from '../../services/admin-report';
import { AdminService } from '../../services/admin';
declare var bootstrap: any;

interface ReportItem {
  id: number;
  listing_title: string;
  reported_by: string;
  reason: string;
  status: string;
  created_at?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  activeSection = 'overview';
  loading = false;

  // Overview Data
  overviewStats = {
    active_users: 0,
    completed_barters: 0,
    active_items: 0
  };

  // Users Data
  users: any[] = [];
  usersPagination = {
    current_page: 1,
    total: 0,
    per_page: 10
  };

  // Offers Data
  listings: any[] = [];
  listingsPagination = {
    current_page: 1,
    total: 0,
    per_page: 10
  };

  // Shipments Data
  shipments: any[] = [];

  // Reports & Verifications (existing)
  verifications: any[] = [];
  reports: ReportItem[] = [];

  constructor(
    private idService: IdVerification,
    private reportService: AdminReport,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.loadOverview();
    // this.loadVerifications();
    // this.loadReports();
  }

  setSection(section: string) {
    this.activeSection = section;

    switch (section) {
      case 'overview':
        this.loadOverview();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'offers':
        this.loadListings();
        break;
      case 'shipping':
        this.loadShipments();
        break;
      case 'verification':
        this.loadVerifications();
        break;
      case 'content':
        this.loadReports();
        break;
    }
  }

  // Overview
  loadOverview() {
    this.loading = true;
    this.adminService.getOverview().subscribe({
      next: (res: any) => {
        this.overviewStats = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load overview', err);
        this.loading = false;
      },
    });
  }

  //Users
  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.data || res;
        if (res.meta) {
          this.usersPagination = {
            current_page: res.meta.current_page,
            total: res.meta.total,
            per_page: res.meta.per_page
          };
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load users', err);
        this.loading = false;
      },
    });
  }

  banUser(user: any) {
    if (!confirm(`Are you sure you want to ban ${user.full_name}?`)) return;

    this.adminService.banUser(user.id).subscribe({
      next: (res: any) => {
        user.status = 'banned';
        alert(res.message || 'User banned successfully');
      },
      error: (err: any) => {
        console.error('Failed to ban user', err);
        alert(err.error?.message || 'Failed to ban user');
      }
    });
  }

  activateUser(user: any) {
    if (!confirm(`Are you sure you want to activate ${user.full_name}?`)) return;

    this.adminService.activateUser(user.id).subscribe({
      next: (res: any) => {
        user.status = 'active';
        alert(res.message || 'User activated successfully');
      },
      error: (err: any) => {
        console.error('Failed to activate user', err);
        alert(err.error?.message || 'Failed to activate user');
      }
    });
  }

  //Listings
  loadListings() {
    this.loading = true;
    this.adminService.getListings().subscribe({
      next: (res: any) => {
        this.listings = res.data || res;
        if (res.meta) {
          this.listingsPagination = {
            current_page: res.meta.current_page,
            total: res.meta.total,
            per_page: res.meta.per_page
          };
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load listings', err);
        this.loading = false;
      },
    });
  }

  toggleListingStatus(listing: any) {
    const action = listing.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this listing?`)) return;

    this.adminService.toggleListingStatus(listing.id).subscribe({
      next: (res: any) => {
        listing.is_active = res.is_active;
        alert(res.message || 'Listing status updated');
      },
      error: (err: any) => {
        console.error('Failed to toggle listing', err);
        alert(err.error?.message || 'Failed to update listing');
      }
    });
  }

  // Shipments
  loadShipments() {
    this.loading = true;
    this.adminService.getShipments().subscribe({
      next: (res: any) => {
        this.shipments = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load shipments', err);
        this.loading = false;
      },
    });
  }

  updateShipmentStatus(shipment: any, event: Event) {

    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    if (!confirm(`Update shipment status to ${newStatus}?`)) return;

    this.adminService.updateShipmentStatus(shipment.id, newStatus).subscribe({
      next: (res: any) => {
        shipment.status = newStatus;
        alert(res.message || 'Shipment status updated');
      },
      error: (err: any) => {
        console.error('Failed to update shipment', err);
        alert(err.error?.message || 'Failed to update shipment');
      }
    });
  }

  // Verification
  loadVerifications() {
    this.loading = true;
    this.idService.getAllVerifications().subscribe({
      next: (res: any) => {
        this.verifications = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load verifications', err);
        this.loading = false;
      },
    });
  }

  approve(v: any) {
    this.idService.approve(v.id).subscribe({
      next: () => (v.status = 'verified'),
      error: (err: any) => console.error(err),
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
      error: (err: any) => console.error(err),
    });
  }

  // Reports
  loadReports() {
    this.loading = true;
    this.reportService.getReports().subscribe({
      next: (res: any) => {
        this.reports = res.data as ReportItem[];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load reports', err);
        this.loading = false;
      },
    });
  }

  dismissReport(r: any) {
    this.reportService.dismissReport(r.id).subscribe({
      next: () => {
        r.status = 'reviewed';
      },
      error: (err: any) => console.error(err),
    });
  }

  removeReport(r: any) {
    if (!confirm('Are you sure you want to remove this offer?')) return;

    this.reportService.removeOffer(r.id).subscribe({
      next: () => {
        r.status = 'removed';
        this.reports = this.reports.filter((rep) => rep.id !== r.id);
      },
      error: (err: any) => console.error(err),
    });
  }

  toggleUserStatus(u: any) {
    u.status = u.status === 'Active' ? 'Banned' : 'Active';
  }

  //Utility
  fullscreenImg: string = '';
  openFullscreen(url: string) {
    this.fullscreenImg = url;
    const modalElement = document.getElementById('fullscreenModal');
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();
  }
}
