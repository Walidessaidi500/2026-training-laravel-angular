import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';

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
