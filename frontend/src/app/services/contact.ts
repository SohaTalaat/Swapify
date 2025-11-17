import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/contact';

  constructor(private http: HttpClient) { }

  /**
   * Submit contact form
   * @param data Contact form data containing name, email, and message
   * @returns Observable with success response
   */
  submitContactForm(data: ContactFormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
