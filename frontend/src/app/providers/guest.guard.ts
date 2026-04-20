import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@app/services/auth/auth.service";

export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.getUser();
        if (user?.role === 'supervisor') {
            router.navigate(['/supervisor/dashboard']);
        } else if (user?.role === 'admin') {
            router.navigate(['/admin/dashboard']);
        } else if (user?.role === 'operator' || user?.role === 'restaurant') {
            router.navigate(['/employee/tpv']);
        }
        return false;
    }

    return true;

};

