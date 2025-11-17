import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Category {
  id: number;
  name: string;
}

export interface ListingImage {
  url: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  type: string;
  condition: string;
  is_active: boolean;
  user_id: number;
  category_id: number;

  // Add these optional relations
  category?: Category; // <-- this was missing
  images?: ListingImage[]; // <-- ensure it's an array (even if empty)
}

export interface RecommendationItem {
  listing: Listing;
  similarity: number;
}

interface RecommendationResponse {
  message: string;
  recommendations: RecommendationItem[];
}
@Injectable({
  providedIn: 'root',
})
export class RecommendationsService {
  private base = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('swapify_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }

  getRecommendations(): Observable<RecommendationResponse> {
    return this.http.get<RecommendationResponse>(`${this.base}/recommendations`, {
      headers: this.getAuthHeaders(),
    });
  }
}
