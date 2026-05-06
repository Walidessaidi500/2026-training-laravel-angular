import { Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';

/**
 * Guard de autenticacion que se utiliza para proteger 
 * rutas que requieren autenticacion
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/home']);
  return false;
  
};