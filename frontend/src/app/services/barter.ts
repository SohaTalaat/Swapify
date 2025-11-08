// src/app/services/barter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ---------- Listing Models ----------
export interface ListingImage {
  id: number;
  listing_id: number;
  image_url: string;
}

export interface ListingPivot {
  barter_id: number;
  listing_id: number;
  owner_user_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Listing {
  id: number;
  title: string;
  user_id?: number;
  owner_user_id?: number; // sometimes backend may include it directly
  pivot?: ListingPivot;
  user?: { username: string; profile_picture_url?: string };
  category?: { id: number; name: string };
  images?: ListingImage[];
}

// ---------- Barter Models ----------
export interface BarterParticipant {
  id: number;
  username: string;
  pivot: {
    barter_id: number;
    user_id: number;
    role: 'requesting' | 'offering';
    created_at?: string;
    updated_at?: string;
  };
}

export interface BarterMessage {
  id: number;
  sender_id: number;
  content: string; // ✅ بدل message
  created_at: string;
  sender?: { username: string }; // ✅ بدل user
}

export interface BarterChat {
  id: number;
  messages: BarterMessage[];
}

export interface Barter {
  id: number;
  status: string;
  exchange_type: 'delivery' | 'in_person';
  meeting_location?: string;
  meeting_time?: string;
  shipping_address_id?: number;
  created_at: string;
  participants: BarterParticipant[];
  listings: {
    id: number;
    title: string;
    images?: { image_url: string }[];
    pivot: {
      barter_id: number;
      listing_id: number;
      owner_user_id: number;
    };
  }[];
  chat?: {
    id: number;
    messages: BarterMessage[];
  };
}

// ---------- Request Payloads ----------
export interface CreateBarterData {
  receiver_id: number;
  offered_listing_id: number;
  requested_listing_id: number;
  exchange_type: 'delivery' | 'in_person';
  meeting_location?: string | null;
  meeting_time?: string | null;
  shipping_address_id?: number | null;
}

export interface SendMessageData {
  content: string;
}

export interface BarterViewModel {
  id: number;
  title: string;
  partner: string;
  status: string;
  date: string;
  raw: Barter;
}

// ---------- Service ----------
@Injectable({
  providedIn: 'root',
})
export class BarterService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('swapify_token');
    if (!token) console.error('No token found');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  // 🟦 Listings
  getMyListings(): Observable<Listing[]> {
    return this.http
      .get<Listing[]>(`${this.apiUrl}/listings/my`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getOthersListings(): Observable<Listing[]> {
    return this.http
      .get<Listing[]>(`${this.apiUrl}/listings`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getListing(id: number): Observable<Listing> {
    return this.http
      .get<Listing>(`${this.apiUrl}/listings/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 🟧 Barters
  createBarter(data: CreateBarterData): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/barters`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getMyBarters(): Observable<Barter[]> {
    return this.http
      .get<Barter[]>(`${this.apiUrl}/barters`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getBarter(id: number): Observable<Barter> {
    return this.http
      .get<Barter>(`${this.apiUrl}/barters/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 🟩 Chat
  // في دالة sendMessage
  sendMessage(barterId: number, data: SendMessageData) {
    const payload = {
      ...data,
      barter_id: barterId, // أضف barter_id هنا
    };

    return this.http
      .post<{ message: BarterMessage }>(`${this.apiUrl}/barters/${barterId}/messages`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // 🔴 Error handler
  private handleError(error: HttpErrorResponse) {
    const msg = error.error?.message || 'An unknown error occurred!';
    return throwError(() => new Error(msg));
  }

  updateStatus(barterId: number, status: string): Observable<any> {
    const token = localStorage.getItem('swapify_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put(`${this.apiUrl}/barters/${barterId}/status`, { status }, { headers });
  }
  deleteBarter(barterId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/barters/${barterId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}
