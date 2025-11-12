import { Component, OnInit } from '@angular/core';
import { RecommendationsService, RecommendationItem } from '../../services/recommendations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-recommendations',
  imports: [RouterLink, CommonModule, MatCardModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.css',
})
export class Recommendations {
  items: RecommendationItem[] = [];
  message = '';
  loading = true;
  error = '';

  constructor(private recService: RecommendationsService, private router: Router) {}

  ngOnInit(): void {
    this.recService.getRecommendations().subscribe({
      next: (resp) => {
        this.message = resp.message;
        this.items = resp.recommendations;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  viewListing(id: number) {
    this.router.navigate(['/offer-details', id]);
  }
}
