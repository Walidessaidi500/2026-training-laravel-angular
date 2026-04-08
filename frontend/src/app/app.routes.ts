import { Routes } from '@angular/router';
import { authGuard } from '@providers/auth.guard';
import { guestGuard } from './providers/guest.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/core/home/home.page').then((m) => m.HomePage),
    canActivate: [guestGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/core/login/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'supervisor',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/supervisor/supervisor.routes').then((m) => m.SUPERVISOR_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
