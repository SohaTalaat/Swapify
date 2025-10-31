import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-login-callback',
  imports: [CommonModule],
  templateUrl: './login-callback.html',
  styleUrl: './login-callback.css'
})
export class LoginCallback implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = 'Logging you in...';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        this.status = 'error';
        this.message = 'Login failed: ' + decodeURIComponent(error);
        setTimeout(() => this.router.navigate(['/login']), 2500);
        return;
      }

      if (token) {
        this.status = 'success';
        this.message = 'Login successful! Redirecting...';
        localStorage.setItem('token', token);
        setTimeout(() => this.router.navigate(['/profile']), 1500);
      } else {
        this.status = 'error';
        this.message = 'Invalid login attempt.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    });
  }
}
