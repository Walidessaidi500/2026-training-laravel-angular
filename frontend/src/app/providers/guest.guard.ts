import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService} from "@app/services/auth/auth.service";

export const guestGuard: CanActivateFn = (route, state) => { 
    const authService = inject(AuthService);
    const router = inject(Router);

if (authService.isAuthenticated()) {
    
    router.navigate(['/admin/dashboard']);
    return false;
}

return true;

};

