import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { guestGuard } from '@guards/guest.guard';
import { roleGuard } from '@guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/core/login/login.page').then((m) => m.LoginPage),
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
    path: 'employee',
    canActivate: [authGuard, roleGuard(['operator', 'supervisor', 'restaurant'])],
    loadChildren: () => import('./pages/employee/employee.routes').then((m) => m.EMPLOYEE_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
