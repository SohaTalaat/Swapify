import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    alert('Reset code sent to your email.');
    this.router.navigate(['/reset-password']);
  }
}
