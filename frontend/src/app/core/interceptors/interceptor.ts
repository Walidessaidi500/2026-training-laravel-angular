import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from '@services/auth/auth.service';
import { environment } from '@environments/environment';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let url = request.url;

    // Prefijar con apiUrl si la URL es relativa
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('./') && !url.startsWith('assets/')) {
      const baseUrl = environment.apiUrl.endsWith('/') 
        ? environment.apiUrl.slice(0, -1) 
        : environment.apiUrl;
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      url = `${baseUrl}${cleanUrl}`;
    }

    const authRequest = request.clone({
      url: url,
      setHeaders: this.getHeaders(),
    });

    return next.handle(authRequest);
  }

  private getHeaders(): { [header: string]: string } {
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();

    const headers: { [header: string]: string } = {
      Accept: 'application/json',
      'Accept-Language': 'es',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}
