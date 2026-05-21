import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { guestGuard } from '@guards/guest.guard';
import { roleGuard } from '@guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'supervisor',
    canActivate: [authGuard, roleGuard(['supervisor'])],
    loadChildren: () => import('./pages/supervisor/supervisor.routes').then((m) => m.SUPERVISOR_ROUTES),
  },
  {
    path: 'tpv',
    canActivate: [authGuard, roleGuard(['supervisor', 'restaurant'])],
    loadChildren: () => import('./pages/tpv/tpv.routes').then((m) => m.TPV_ROUTES),
  },
  {
    path: 'pda',
    canActivate: [authGuard, roleGuard(['supervisor', 'restaurant'])],
    loadChildren: () => import('./pages/pda/pda.routes').then((m) => m.PDA_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
