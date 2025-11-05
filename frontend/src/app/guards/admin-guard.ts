import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('swapify_token');
  const role = localStorage.getItem('role'); // 👈 نخزنها بعد تسجيل الدخول

  if (token && role === 'admin') {
    return true; // ✅ يسمح بالدخول للـ dashboard
  }

  // 🚫 لو مش admin نرجعه للصفحة الرئيسية أو login
  router.navigate(['/']);
  return false;
};
