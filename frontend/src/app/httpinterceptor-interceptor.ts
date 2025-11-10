// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, throwError, retry } from 'rxjs';

// export const httpInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);

//   // Add auth token to all requests
//   const token = localStorage.getItem('swapify_token');
//   if (token && !req.headers.has('Authorization')) {
//     req = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`,
//         Accept: 'application/json',
//       },
//     });
//   }

//   // Handle response with retry logic
//   return next(req).pipe(
//     retry({
//       count: 2,
//       delay: (error, retryCount) => {
//         // Only retry on network errors, not auth errors
//         if (error.status === 0 || error.status >= 500) {
//           console.log(`Retry attempt ${retryCount}`);
//           return throwError(() => error);
//         }
//         throw error;
//       },
//     }),
//     catchError((error: HttpErrorResponse) => {
//       let errorMessage = 'An unexpected error occurred';

//       if (error.error instanceof ErrorEvent) {
//         // Client-side error
//         errorMessage = `Network Error: ${error.error.message}`;
//         console.error('Client-side error:', error.error.message);
//       } else {
//         // Server-side error
//         switch (error.status) {
//           case 0:
//             errorMessage = '❌ Unable to connect to server. Please check your connection.';
//             break;
//           case 401:
//             errorMessage = '🔒 Your session has expired. Please login again.';
//             localStorage.clear();
//             router.navigate(['/login']);
//             break;
//           case 403:
//             errorMessage = '⛔ Access denied. You do not have permission.';
//             break;
//           case 404:
//             errorMessage = '🔍 Resource not found.';
//             break;
//           case 422:
//             // Validation errors
//             errorMessage = error.error?.message || 'Validation failed';
//             break;
//           case 429:
//             errorMessage = '⏳ Too many requests. Please slow down.';
//             break;
//           case 500:
//             errorMessage = '🔥 Server error. Please try again later.';
//             break;
//           case 503:
//             errorMessage = '🛠️ Service unavailable. Maintenance in progress.';
//             break;
//           default:
//             errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
//         }

//         console.error('Server error:', {
//           status: error.status,
//           message: error.error?.message,
//           url: error.url,
//         });
//       }

//       // Show user-friendly message for non-silent errors
//       if (!req.url.includes('/notifications') && error.status !== 0) {
//         // Don't show alerts for background polling
//         if (!window.location.href.includes('silent=true')) {
//           console.error(errorMessage);
//         }
//       }

//       return throwError(() => ({
//         ...error,
//         userMessage: errorMessage,
//       }));
//     })
//   );
// };
