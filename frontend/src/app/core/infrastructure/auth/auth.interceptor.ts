import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.currentToken();

  const defaultHeaders: any = {
    'Accept': 'application/json',
    'Accept-Language': 'es'
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const cloned = req.clone({
    setHeaders: defaultHeaders
  });

  return next(cloned);
};
