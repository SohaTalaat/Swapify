import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  // Form state
  formData = {
    name: '',
    email: '',
    message: ''
  };

  // UI state
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private contactService: ContactService) { }

  /**
   * Submit contact form
   */
  submitForm(): void {
    // Validate form
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    // Clear previous messages
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    // Submit form
    this.contactService.submitContactForm(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Message sent successfully! We\'ll get back to you soon.';
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.errors) {
          // Handle validation errors
          const errors = Object.values(error.error.errors).flat();
          this.errorMessage = (errors as string[]).join(' ');
        } else {
          this.errorMessage = 'An error occurred while sending your message. Please try again.';
        }
      }
    });
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      message: ''
    };
  }
}
