import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdVerification } from '../../services/id-verification';
import { AdminReport } from '../../services/admin-report';
import { AdminService } from '../../services/admin';
import { EchoService } from '../../services/echo';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
export class AdminDashboard implements OnInit, AfterViewInit {
  // ────── FILTER INPUTS ──────
  searchUsers = '';
  searchListings = '';
  searchReports = '';
  searchVerifications = '';
  searchShipments = '';
  searchDisputes = '';
  searchCancelledBarters = '';
  searchPendingListings = '';

  // ────── DEBOUNCE SUBJECTS ──────
  private userSearch$ = new Subject<string>();
  private listingSearch$ = new Subject<string>();
  private reportSearch$ = new Subject<string>();
  private verificationSearch$ = new Subject<string>();
  private shipmentSearch$ = new Subject<string>();
  private disputeSearch$ = new Subject<string>();
  private cancelledSearch$ = new Subject<string>();
  private pendingSearch$ = new Subject<string>();

  // ────── DATA ──────
  barterStats = { total: 0, cancelled: 0, active: 0 };
  barterReasons: any[] = [];
  reasonsChart: any;
  cancelledBarters: any[] = [];
  activeSection = 'overview';
  loading = false;

  overviewStats = { active_users: 0, completed_barters: 0, active_items: 0 };

  // Users
  users: any[] = [];
  usersPagination = { current_page: 1, total: 0, per_page: 10 };

  // Offers (active listings)
  listings: any[] = [];
  listingsPagination = { current_page: 1, total: 0, per_page: 10 };

  // Shipments
  shipments: any[] = [];

  // Disputes
  disputes: any[] = [];

  // Reports & Verifications
  verifications: any[] = [];
  reports: ReportItem[] = [];

  // Pending listings (approval)
  approvingListings: any[] = [];
  approvingListingsPage = 1;
  approvingListingsLastPage = 1;
  approvingListingsPerPage = 10;
  approvingListingsTotal = 0;
  approvingIds = new Set<number>();

  // Modals
  selectedUserForBan: any = null;
  banReasonInput = '';
  selectedDisputeForResolve: any = null;
  resolutionNotes = '';
  showRejectModal = false;
  rejectingListingId: number | null = null;
  rejectionReason = '';
  isSubmittingReject = false;
  fullscreenImg = '';

  constructor(
    private idService: IdVerification,
    private reportService: AdminReport,
    private adminService: AdminService,
    private echoService: EchoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOverview();
    this.initializeEchoListeners();
    this.setupDebounce();
  }

  ngAfterViewInit() {
    // Chart will be rendered when section becomes active
  }

  /*** ────── FILTER DEBOUNCE ────── ***/
  private setupDebounce() {
    const debounceMs = 300;

    this.userSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyUserFilter());
    this.listingSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyListingFilter());
    this.reportSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyReportFilter());
    this.verificationSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyVerificationFilter());
    this.shipmentSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyShipmentFilter());
    this.disputeSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyDisputeFilter());
    this.cancelledSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyCancelledFilter());
    this.pendingSearch$
      .pipe(debounceTime(debounceMs), distinctUntilChanged())
      .subscribe(() => this.applyPendingFilter());
  }

  // ────── INPUT CHANGE HANDLERS ──────
  onUserSearch(term: string) {
    this.userSearch$.next(term);
  }
  onListingSearch(term: string) {
    this.listingSearch$.next(term);
  }
  onReportSearch(term: string) {
    this.reportSearch$.next(term);
  }
  onVerificationSearch(term: string) {
    this.verificationSearch$.next(term);
  }
  onShipmentSearch(term: string) {
    this.shipmentSearch$.next(term);
  }
  onDisputeSearch(term: string) {
    this.disputeSearch$.next(term);
  }
  onCancelledSearch(term: string) {
    this.cancelledSearch$.next(term);
  }
  onPendingSearch(term: string) {
    this.pendingSearch$.next(term);
  }

  // ────── FILTER IMPLEMENTATIONS ──────
  private applyUserFilter() {
    // no extra work – filteredUsers getter does the job
  }
  private applyListingFilter() {}
  private applyReportFilter() {}
  private applyVerificationFilter() {}
  private applyShipmentFilter() {}
  private applyDisputeFilter() {}
  private applyCancelledFilter() {}
  private applyPendingFilter() {}

  /*** ────── COMPUTED FILTERED ARRAYS ────── ***/
  get filteredUsers() {
    if (!this.searchUsers) return this.users;
    const term = this.searchUsers.toLowerCase();
    return this.users.filter(
      (u) => u.full_name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
  }

  get filteredListings() {
    if (!this.searchListings) return this.listings;
    const term = this.searchListings.toLowerCase();
    return this.listings.filter(
      (l) =>
        l.title?.toLowerCase().includes(term) ||
        l.category?.toLowerCase().includes(term) ||
        l.user_name?.toLowerCase().includes(term)
    );
  }

  get filteredReports() {
    if (!this.searchReports) return this.reports;
    const term = this.searchReports.toLowerCase();
    return this.reports.filter(
      (r) =>
        r.listing_title?.toLowerCase().includes(term) ||
        r.reported_by?.toLowerCase().includes(term) ||
        r.reason?.toLowerCase().includes(term)
    );
  }

  get filteredVerifications() {
    if (!this.searchVerifications) return this.verifications;
    const term = this.searchVerifications.toLowerCase();
    return this.verifications.filter(
      (v) =>
        v.user?.full_name?.toLowerCase().includes(term) ||
        v.user?.email?.toLowerCase().includes(term)
    );
  }

  get filteredShipments() {
    if (!this.searchShipments) return this.shipments;
    const term = this.searchShipments.toLowerCase();
    return this.shipments.filter(
      (s) =>
        s.barter_id?.toString().includes(term) ||
        s.shipping_type?.toLowerCase().includes(term) ||
        s.tracking_number?.toLowerCase().includes(term)
    );
  }

  get filteredDisputes() {
    if (!this.searchDisputes) return this.disputes;
    const term = this.searchDisputes.toLowerCase();
    return this.disputes.filter(
      (d) =>
        d.id?.toString().includes(term) ||
        d.initiator?.username?.toLowerCase().includes(term) ||
        d.barter_id?.toString().includes(term) ||
        d.reason?.toLowerCase().includes(term)
    );
  }

  get filteredCancelledBarters() {
    if (!this.searchCancelledBarters) return this.cancelledBarters;
    const term = this.searchCancelledBarters.toLowerCase();
    return this.cancelledBarters.filter(
      (c) =>
        c.id?.toString().includes(term) ||
        c.cancelled_by_username?.toLowerCase().includes(term) ||
        c.cancel_reason?.toLowerCase().includes(term)
    );
  }

  get filteredPendingListings() {
    if (!this.searchPendingListings) return this.approvingListings;
    const term = this.searchPendingListings.toLowerCase();
    return this.approvingListings.filter(
      (l) =>
        l.title?.toLowerCase().includes(term) ||
        l.user_name?.toLowerCase().includes(term) ||
        l.category?.toLowerCase().includes(term)
    );
  }

  // ────── SECTION SWITCH ──────
  setSection(section: string) {
    this.activeSection = section;
    this.resetFilters(); // optional – clear previous searches
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
      case 'listings-approval':
        this.loadApprovingListings(1);
        break;
    }
  }

  private resetFilters() {
    this.searchUsers =
      this.searchListings =
      this.searchReports =
      this.searchVerifications =
      this.searchShipments =
      this.searchDisputes =
      this.searchCancelledBarters =
      this.searchPendingListings =
        '';
  }

  // ────── ECHO LISTENERS ──────
  initializeEchoListeners() {
    const adminChannel = this.echoService.instance?.private('admin.disputes');
    if (adminChannel) {
      adminChannel.listen('dispute.resolved', (data: any) => {
        const dispute = this.disputes.find((d) => d.id === data.dispute_id);
        if (dispute) {
          dispute.status = data.status;
          dispute.resolution_notes = data.resolution_notes;
          dispute.resolved_by_admin_id = data.resolved_by_admin_id;
        }
      });
    }
  }

  // ────── OVERVIEW ──────
  loadOverview() {
    this.loading = true;
    this.adminService.getOverview().subscribe({
      next: (res: any) => {
        this.overviewStats = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  // ────── USERS ──────
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
      error: () => (this.loading = false),
    });
  }

  // ────── BAN / ACTIVATE ──────
  banUser(user: any) {
    this.selectedUserForBan = user;
    this.banReasonInput = user.ban_reason || '';
    const el = document.getElementById('adminBanModal');
    const modal = el ? new bootstrap.Modal(el) : null;
    modal?.show();
  }

  confirmBan(reason?: string) {
    const r = reason ?? this.banReasonInput?.trim();
    if (!r) {
      alert('Ban reason required');
      return;
    }
    const user = this.selectedUserForBan;
    this.adminService.banUser(user.id, r).subscribe({
      next: () => {
        user.status = 'banned';
        user.ban_reason = r;
        bootstrap.Modal.getInstance(document.getElementById('adminBanModal')!)?.hide();
      },
      error: (e) => alert(e.error?.message ?? 'Failed'),
    });
  }

  activateUser(user: any) {
    if (!confirm(`Activate ${user.full_name}?`)) return;
    this.adminService.activateUser(user.id).subscribe({
      next: () => (user.status = 'active'),
      error: (e) => alert(e.error?.message ?? 'Failed'),
    });
  }

  // ────── OFFERS (ACTIVE LISTINGS) ──────
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
      error: () => (this.loading = false),
    });
  }

  toggleListingStatus(listing: any) {
    const action = listing.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Sure to ${action} this listing?`)) return;
    this.adminService.toggleListingStatus(listing.id).subscribe({
      next: (res: any) => (listing.is_active = res.is_active),
      error: () => {},
    });
  }

  // ────── SHIPMENTS ──────
  loadShipments() {
    this.loading = true;
    this.adminService.getShipments().subscribe({
      next: (res: any) => {
        this.shipments = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  updateShipmentStatus(shipment: any, newStatus: string) {
    if (!confirm(`Change status to ${newStatus}?`)) {
      this.loadShipments();
      return;
    }
    this.adminService.updateShipmentStatus(shipment.id, newStatus).subscribe({
      next: () => (shipment.status = newStatus),
      error: () => this.loadShipments(),
    });
  }

  // ────── DISPUTES ──────
  loadDisputes() {
    this.loading = true;
    this.adminService.getDisputes().subscribe({
      next: (res: any) => {
        this.disputes = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openResolveDisputeModal(dispute: any) {
    this.selectedDisputeForResolve = dispute;
    this.resolutionNotes = '';
    const el = document.getElementById('resolveDisputeModal');
    new bootstrap.Modal(el!).show();
  }

  confirmResolveDispute() {
    if (!this.resolutionNotes.trim()) {
      alert('Notes required');
      return;
    }
    this.adminService
      .resolveDispute(this.selectedDisputeForResolve.id, this.resolutionNotes.trim())
      .subscribe({
        next: () => {
          this.selectedDisputeForResolve.status = 'resolved';
          this.selectedDisputeForResolve.resolution_notes = this.resolutionNotes;
          bootstrap.Modal.getInstance(document.getElementById('resolveDisputeModal')!)?.hide();
          this.loadDisputes();
        },
        error: (e) => alert(e.error?.message ?? 'Failed'),
      });
  }

  // ────── VERIFICATIONS ──────
  loadVerifications() {
    this.loading = true;
    this.idService.getAllVerifications().subscribe({
      next: (res: any) => {
        this.verifications = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  approve(v: any) {
    this.idService.approve(v.id).subscribe(() => (v.status = 'verified'));
  }

  reject(v: any) {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    this.idService.reject(v.id, reason).subscribe(() => {
      v.status = 'rejected';
      v.rejection_reason = reason;
    });
  }

  // ────── CONTENT REPORTS ──────
  loadReports() {
    this.loading = true;
    this.reportService.getReports().subscribe({
      next: (res: any) => {
        this.reports = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  dismissReport(r: any) {
    this.reportService.dismissReport(r.id).subscribe(() => (r.status = 'reviewed'));
  }

  removeReport(r: any) {
    if (!confirm('Remove this offer?')) return;
    this.reportService.removeOffer(r.id).subscribe(() => {
      this.reports = this.reports.filter((rep) => rep.id !== r.id);
    });
  }

  // ────── FULLSCREEN IMAGE ──────
  openFullscreen(url: string) {
    this.fullscreenImg = url;
    new bootstrap.Modal(document.getElementById('fullscreenModal')!).show();
  }

  // ────── BARTER STATS ──────
  loadBarterStats() {
    this.loading = true;
    this.adminService.getBarterStats().subscribe({
      next: (res: any) => {
        this.barterStats = res.stats;
        this.barterReasons = res.reasons;
        this.loadCancelledBarters();
        this.renderReasonsChart();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadCancelledBarters() {
    this.adminService.getCancelledBarters().subscribe({
      next: (data: any[]) => (this.cancelledBarters = data),
      error: () => {},
    });
  }

  renderReasonsChart() {
    if (this.reasonsChart) this.reasonsChart.destroy();

    setTimeout(() => {
      const ctx = document.getElementById('reasonsChart') as HTMLCanvasElement;
      if (!ctx) return;

      const labels = this.barterReasons.map((r) => r.cancel_reason);
      const data = this.barterReasons.map((r) => r.count);

      this.reasonsChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              label: 'Reasons',
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
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' as const } } },
      });
    }, 0);
  }

  // ────── LISTINGS APPROVAL ──────
  loadApprovingListings(page: number = 1) {
    this.loading = true;
    this.adminService.getListings().subscribe({
      next: (res: any) => {
        const all = res.data || res;
        this.approvingListings = all.filter((l: any) => l.approval_status === 'pending');
        this.approvingListingsPage = page;
        this.approvingListingsTotal = this.approvingListings.length;
        this.approvingListingsLastPage = Math.ceil(
          this.approvingListingsTotal / this.approvingListingsPerPage
        );
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  approveListing(listing: any) {
    this.approvingIds.add(listing.id);
    this.adminService.approveListing(listing.id).subscribe({
      next: () => {
        this.approvingListings = this.approvingListings.filter((l) => l.id !== listing.id);
        this.approvingIds.delete(listing.id);
      },
      error: () => this.approvingIds.delete(listing.id),
    });
  }

  openRejectModal(listing: any) {
    this.rejectingListingId = listing.id;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectingListingId = null;
    this.rejectionReason = '';
  }

  submitReject() {
    if (!this.rejectionReason.trim()) {
      alert('Reason required');
      return;
    }
    this.isSubmittingReject = true;
    this.adminService.rejectListing(this.rejectingListingId!, this.rejectionReason).subscribe({
      next: () => {
        this.approvingListings = this.approvingListings.filter(
          (l) => l.id !== this.rejectingListingId
        );
        this.closeRejectModal();
        this.isSubmittingReject = false;
      },
      error: () => (this.isSubmittingReject = false),
    });
  }

  getPendingListingsCount(): number {
    return this.approvingListings.length;
  }

  goToApprovingListingsPage(p: number) {
    this.loadApprovingListings(p);
  }
  prevApprovingListingsPage() {
    if (this.approvingListingsPage > 1) this.loadApprovingListings(this.approvingListingsPage - 1);
  }
  nextApprovingListingsPage() {
    if (this.approvingListingsPage < this.approvingListingsLastPage)
      this.loadApprovingListings(this.approvingListingsPage + 1);
  }
}
