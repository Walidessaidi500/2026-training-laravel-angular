import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';


/**
 * Guard de rol que se utiliza para proteger rutas que requieren un rol específico
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getUser();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }


    router.navigate(['/home']);
    return false;
  };
};
