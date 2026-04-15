import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from '@services/auth/auth.service';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {
  constructor(private injector: Injector) {}


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.setHeader(request));
  }


  private setHeader(request: HttpRequest<any>): HttpRequest<any> {
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();

    const headers: any = {
      Accept: 'application/json',
      'Accept-Language': 'es',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request.clone({
      setHeaders: headers,
    });
  }
}
