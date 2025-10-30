import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  getField(field: string) {
    return this.loginForm.get(field);
  }

  onSubmit() {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        // Store the token in localStorage
        if (res.token) {
          localStorage.setItem('swapify_token', res.token);
        }

        this.successMessage.set('✅ Logged in successfully!');
        console.log('User token:', res.token);
        localStorage.setItem('email', res.user.email);

        this.loginForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set(err.error?.message || '❌ Invalid credentials. Please try again.');
      },
    });
  }

  backToLogin() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
