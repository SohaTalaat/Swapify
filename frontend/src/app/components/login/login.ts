import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  private router = inject(Router);

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
        if (res.token) {
          // ✅ حفظ التوكن
          this.auth.setToken(res.token);
        }

        if (res.user) {
          // ✅ حفظ بيانات المستخدم العامة
          this.auth.setUserData(res.user);

          // ✅ حفظ إضافي لكامل بيانات المستخدم في localStorage
          localStorage.setItem('swapify_user', JSON.stringify(res.user));
          localStorage.setItem('email', res.user.email);
          localStorage.setItem('role', res.user.role || '');
        }

        // ✅ عرض رسالة النجاح والتنقل
        this.successMessage.set('✅ Logged in successfully!');
        this.loginForm.reset();
        this.router.navigate(['/']);
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
  loginWithGoogle() {
    window.location.href = 'http://127.0.0.1:8000/api/auth/google/redirect';
  }
}
