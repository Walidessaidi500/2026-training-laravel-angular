import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@services/auth/auth.service";


/**
 * Guard de invitado que se utiliza para proteger rutas que solo pueden ser accedidas por usuarios no autenticados
 * Si el usuario esta autenticado, se redirige a su dashboard segun su rol
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.getUser();
        if (user?.role === 'supervisor') {
            router.navigate(['/supervisor/dashboard']);
        } else if (user?.role === 'admin') {
            router.navigate(['/admin/dashboard']);
        } else if (user?.role === 'restaurant') {
            router.navigate(['/tpv']);
        }
        return false;
    }

    return true;

};

