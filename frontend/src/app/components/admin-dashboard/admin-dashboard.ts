import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdVerification } from '../../services/id-verification';
import { AdminReport } from '../../services/admin-report';
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
  verifications: any[] = [];
  reports: ReportItem[] = [];
  loading = false;

  constructor(private idService: IdVerification, private reportService: AdminReport) {}

  ngOnInit() {
    this.loadVerifications();
    this.loadReports();
  }

  setSection(section: string) {
    this.activeSection = section;
    if (section === 'verification') this.loadVerifications();
    else if (section === 'content') this.loadReports();
  }

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
        r.status = 'reviewed'; // تغيير الحالة محليًا
        // بمجرد تغيير الحالة، الخلفية وظهور الأزرار يتحدث تلقائيًا
      },
      error: (err: any) => console.error(err),
    });
  }

  removeReport(r: any) {
    if (!confirm('Are you sure you want to remove this offer?')) return;

    this.reportService.removeOffer(r.id).subscribe({
      next: () => {
        r.status = 'removed'; // يمكن أيضًا حذفه من المصفوفة إذا تريد اختفاء العنصر
        this.reports = this.reports.filter((rep) => rep.id !== r.id); // إزالة العنصر من الصفحة
      },
      error: (err: any) => console.error(err),
    });
  }

  toggleUserStatus(u: any) {
    u.status = u.status === 'Active' ? 'Banned' : 'Active';
  }

  fullscreenImg: string = '';
  openFullscreen(url: string) {
    this.fullscreenImg = url;
    const modalElement = document.getElementById('fullscreenModal');
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();
  }
}
