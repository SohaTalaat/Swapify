import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    password_confirmation: ['', Validators.required],
  });

  onSubmit() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // عشان تظهر كل الأخطاء
      return;
    }

    this.auth.register(this.registerForm.value).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem('swapify_token', res.token);
          localStorage.setItem('email', res.user.email);
        }
        console.log('✅ Registration success:', res);
        this.successMessage.set(
          'Account created successfully! Please check your email to activate the account.'
        );
        this.registerForm.reset();
      },
      error: (err) => {
        console.error('❌ Registration error:', err);
        this.errorMessage.set(
          err.error?.message || 'An error occurred while registering, please try again.'
        );
      },
    });
  }
  getField(field: string) {
    return this.registerForm.get(field);
  }
  backToRegister() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
