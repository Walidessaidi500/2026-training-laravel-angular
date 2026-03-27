import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { apiErrorInterceptor } from './services/api/api-error.interceptor';
import { authInterceptor } from './core/infrastructure/auth/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { API_BASE_URL } from './services/api/api-client.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor]), withFetch()),
    provideAnimationsAsync(),
    { provide: API_BASE_URL, useValue: environment.apiUrl },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios' }),
  ]
};