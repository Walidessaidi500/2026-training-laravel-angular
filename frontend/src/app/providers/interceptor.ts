import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from '@services/auth/auth.service';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  /**
   * Intercepta las peticiones HTTP y les añade las cabeceras por defecto
   * Incluye el token de autenticación si está disponible
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.setHeader(request));
  }

  /**
   * Clona la petición añadiendo las cabeceras y el token de autenticación
   */
  private setHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();

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
