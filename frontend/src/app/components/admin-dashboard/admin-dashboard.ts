import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdVerification } from '../../services/id-verification';
import { AdminReport } from '../../services/admin-report';
import { AdminService } from '../../services/admin';
import { EchoService } from '../../services/echo';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

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
  barterStats = { total: 0, cancelled: 0, active: 0 };
  barterReasons: any[] = [];
  reasonsChart: any;
  cancelledBarters: any[] = [];
  activeSection = 'overview';
  loading = false;

  // Overview Data
  overviewStats = {
    active_users: 0,
    completed_barters: 0,
    active_items: 0,
  };

  // Users Data
  users: any[] = [];
  usersPagination = {
    current_page: 1,
    total: 0,
    per_page: 10,
  };

  // Offers Data
  listings: any[] = [];
  listingsPagination = {
    current_page: 1,
    total: 0,
    per_page: 10,
  };

  // Shipments Data
  shipments: any[] = [];

  // Disputes Data
  disputes: any[] = [];
  selectedDisputeForResolve: any = null;
  resolutionNotes: string = '';

  // Reports & Verifications (existing)
  verifications: any[] = [];
  reports: ReportItem[] = [];

  constructor(
    private idService: IdVerification,
    private reportService: AdminReport,
    private adminService: AdminService,
    private echoService: EchoService,
    private router: Router
  ) { }

  // Ban modal state
  selectedUserForBan: any = null;
  banReasonInput: string = '';

  ngOnInit() {
    this.loadOverview();
    this.initializeEchoListeners();
  }

  initializeEchoListeners() {
    // Listen for dispute events on the admin.disputes channel
    const adminChannel = this.echoService.instance?.private('admin.disputes');
    if (adminChannel) {
      adminChannel
        .listen('dispute.resolved', (data: any) => {
          console.log('Dispute resolved event received:', data);
          // Update the dispute in the local list
          const dispute = this.disputes.find(d => d.id === data.dispute_id);
          if (dispute) {
            dispute.status = data.status;
            dispute.resolution_notes = data.resolution_notes;
            dispute.resolved_by_admin_id = data.resolved_by_admin_id;
          }
        });
    }
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
      case 'disputes':
        this.loadDisputes();
        break;
      case 'verification':
        this.loadVerifications();
        break;
      case 'content':
        this.loadReports();
        break;
      case 'barter-stats':
        this.loadBarterStats();
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
            per_page: res.meta.per_page,
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

    // Open modal and set selected user
    this.selectedUserForBan = user;
    this.banReasonInput = user.ban_reason || '';
    const el = document.getElementById('adminBanModal');
    if (el) {
      // @ts-ignore
      const m = new (window as any).bootstrap.Modal(el);
      m.show();
    } else {
      // fallback to prompt
      const reason = prompt('Enter reason for banning this user:');
      if (!reason) return;
      this.confirmBan(reason);
    }
  }

  confirmBan(reason?: string) {
    const r = reason !== undefined ? reason : this.banReasonInput;
    if (!r || r.trim() === '') {
      alert('Ban reason is required.');
      return;
    }

    const user = this.selectedUserForBan;
    if (!user) return;

    this.adminService.banUser(user.id, r.trim()).subscribe({
      next: (res: any) => {
        user.status = 'banned';
        user.ban_reason = r.trim();
        alert(res.message || 'User banned successfully');
        // hide modal
        const el = document.getElementById('adminBanModal');
        if (el) {
          // @ts-ignore
          const m = (window as any).bootstrap.Modal.getInstance(el);
          if (m) m.hide();
        }
      },
      error: (err: any) => {
        console.error('Failed to ban user', err);
        alert(err.error?.message || 'Failed to ban user');
      },
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
      },
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
            per_page: res.meta.per_page,
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
      },
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

  updateShipmentStatus(shipment: any, newStatus: string) {
    if (!confirm(`Update shipment status to ${newStatus}?`)) {
      // revert selection in UI to previous value by reloading shipments or undoing assignment
      this.loadShipments();
      return;
    }

    this.adminService.updateShipmentStatus(shipment.id, newStatus).subscribe({
      next: (res: any) => {
        // update already bound via ngModel; ensure local model matches server
        shipment.status = newStatus;
        alert(res.message || 'Shipment status updated');
      },
      error: (err: any) => {
        console.error('Failed to update shipment', err);
        alert(err.error?.message || 'Failed to update shipment');
        // revert selection by reloading shipments
        this.loadShipments();
      },
    });
  }

  // Disputes
  loadDisputes() {
    this.loading = true;
    this.adminService.getDisputes().subscribe({
      next: (res: any) => {
        this.disputes = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load disputes', err);
        this.loading = false;
      },
    });
  }

  openResolveDisputeModal(dispute: any) {
    this.selectedDisputeForResolve = dispute;
    this.resolutionNotes = '';
    const el = document.getElementById('resolveDisputeModal');
    if (el) {
      // @ts-ignore
      const m = new (window as any).bootstrap.Modal(el);
      m.show();
    }
  }

  confirmResolveDispute() {
    if (!this.selectedDisputeForResolve || !this.resolutionNotes.trim()) {
      alert('Please enter resolution notes');
      return;
    }

    this.adminService
      .resolveDispute(this.selectedDisputeForResolve.id, this.resolutionNotes.trim())
      .subscribe({
        next: (res: any) => {
          this.selectedDisputeForResolve.status = 'resolved';
          this.selectedDisputeForResolve.resolution_notes = this.resolutionNotes;
          alert(res.message || 'Dispute resolved successfully');
          // hide modal
          const el = document.getElementById('resolveDisputeModal');
          if (el) {
            // @ts-ignore
            const m = (window as any).bootstrap.Modal.getInstance(el);
            if (m) m.hide();
          }
          this.loadDisputes();
        },
        error: (err: any) => {
          console.error('Failed to resolve dispute', err);
          alert(err.error?.message || 'Failed to resolve dispute');
        },
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

  loadBarterStats() {
    this.loading = true;
    this.adminService.getBarterStats().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.barterStats = res.stats;
        this.barterReasons = res.reasons;

        // Load cancelled barters list
        this.loadCancelledBarters();

        this.renderReasonsChart();
      },
      error: (err: any) => {
        console.error('Failed to load barter stats', err);
        this.loading = false;
      },
    });
  }

  loadCancelledBarters() {
    this.adminService.getCancelledBarters().subscribe({
      next: (data: any[]) => {
        this.cancelledBarters = data;
      },
      error: (err) => {
        console.error('Failed to load cancelled barters', err);
      },
    });
  }

  renderReasonsChart() {
    const labels = this.barterReasons.map((r: any) => r.cancel_reason);
    const data = this.barterReasons.map((r: any) => r.count);

    console.log('Reasons data:', this.barterReasons);

    // Destroy previous chart
    if (this.reasonsChart) {
      this.reasonsChart.destroy();
    }

    // Wait for DOM to render the canvas
    setTimeout(() => {
      const ctx = document.getElementById('reasonsChart') as HTMLCanvasElement;
      if (!ctx) {
        console.error('Canvas element #reasonsChart not found!');
        return;
      }

      this.reasonsChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              label: 'Cancellation Reasons',
              data,
              backgroundColor: [
                '#007bff',
                '#28a745',
                '#ffc107',
                '#dc3545',
                '#6f42c1',
                '#20c997',
                '#fd7e14',
                '#e83e8c',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom' as const,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                  return `${label}: ${value} (${percentage})`;
                },
              },
            },
          },
        },
      });
    }, 0); // This pushes execution to the next tick
  }
}
