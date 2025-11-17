import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upgrade-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="upgrade-overlay d-flex justify-content-center align-items-center">
      <div class="upgrade-card shadow-lg rounded-4 p-5 bg-white">
        <button class="btn-close float-end" (click)="close()"></button>

        <h3 class="text-center mb-3 fw-bold text-danger">
          <i class="fa-solid fa-star me-2"></i>Upgrade Your Plan
        </h3>

        <p class="text-center text-muted mb-4">
          You've reached your barter limit. Upgrade to create more barters!
        </p>

        <!-- Current Status -->
        <div class="alert alert-info mb-4">
          <strong>Current Limit:</strong> {{ currentLimit }} barters
          <br />
          <strong>Used:</strong> {{ bartersUsed }} barters
          <br />
          <strong>Remaining:</strong> {{ currentLimit - bartersUsed }} barters
        </div>

        <!-- Plans -->
        <div class="plans-container">
          <div *ngFor="let plan of plans" class="plan-card mb-3 p-4 border rounded-3" [ngClass]="{ 'border-success': plan.tier === 'premium' }" (click)="plan.tier !== 'free' && selectPlan(plan)">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1 fw-bold text-uppercase">
                  <i *ngIf="plan.tier === 'free'" class="fa-solid fa-gift me-2"></i>
                  <i *ngIf="plan.tier === 'pro'" class="fa-solid fa-rocket me-2"></i>
                  <i *ngIf="plan.tier === 'premium'" class="fa-solid fa-crown me-2 text-warning"></i>
                  {{ plan.tier }}
                </h5>
                <p class="mb-0 text-muted">
                  <strong>{{ plan.limit }}</strong> barters / month
                </p>
              </div>
              <div class="text-end">
                <p class="mb-2 fs-5 fw-bold">{{ plan.price === 0 ? 'Free' : plan.price }}</p>
                <button
                  *ngIf="plan.tier !== 'free'"
                  class="btn btn-sm btn-gradient"
                  (click)="selectPlan(plan)"
                >
                  Upgrade
                </button>
                <button
                  *ngIf="plan.tier === 'free'"
                  class="btn btn-sm btn-secondary"
                  disabled
                >
                  Current Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancel Button -->
        <div class="text-center mt-4">
          <button class="btn btn-outline-secondary" (click)="close()">Maybe Later</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upgrade-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1050;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .upgrade-card {
      max-width: 500px;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .plan-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .plan-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .plan-card.border-success {
      border: 2px solid #28a745 !important;
      background: rgba(40, 167, 69, 0.05);
    }

    .btn-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      transition: all 0.3s ease;
    }

    .btn-gradient:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transform: translateY(-2px);
      color: white;
    }
  `]
})
export class UpgradePrompt {
  @Input() isVisible = false;
  @Input() currentLimit = 2;
  @Input() bartersUsed = 0;
  @Input() plans: any[] = [
    { tier: 'free', limit: 2, price: 0 },
    { tier: 'pro', limit: 5, price: '$9.99/month' },
    { tier: 'premium', limit: 20, price: '$19.99/month' },
  ];

  @Output() closed = new EventEmitter<void>();
  @Output() planSelected = new EventEmitter<any>();

  constructor(private router: Router) { }

  close() {
    this.closed.emit();
  }

  selectPlan(plan: any) {
    this.planSelected.emit(plan);
    // Navigate to subscription page with selected plan
    this.router.navigate(['/subscription'], { queryParams: { plan: plan.tier } });
  }
}
