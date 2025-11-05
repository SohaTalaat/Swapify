import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('swapify_token');
  const tokenFromUrl = route.queryParams['token']; // ← جاي من رابط Laravel

  if (token || tokenFromUrl) {
    return true;
  } else {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
};
