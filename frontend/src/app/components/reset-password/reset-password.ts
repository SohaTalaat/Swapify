import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  newPassword = '';
  confirmPassword = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    alert('Password reset successful!');
    this.router.navigate(['/login']);
  }
}
