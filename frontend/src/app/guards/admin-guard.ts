import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('swapify_token');
  const role = localStorage.getItem('role');

  if (token && role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  return false;
};

