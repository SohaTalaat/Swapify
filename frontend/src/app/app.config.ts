// import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes)
//   ]
// };

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // ✅ لإضافة HttpClient

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ معالجة الأخطاء على مستوى التطبيق
    provideBrowserGlobalErrorListeners(),

    // ✅ تفعيل نظام التوجيه (Routing)
    provideRouter(routes),

    // ✅ تفعيل HttpClient بدون HttpClientModule (البديل الحديث)
    provideHttpClient(withFetch()),
  ],
};
