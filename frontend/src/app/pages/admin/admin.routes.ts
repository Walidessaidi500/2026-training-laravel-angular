import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.page').then((m) => m.UsersPage),
      },
      {
        path: 'taxes',
        loadComponent: () => import('./taxes/taxes.page').then((m) => m.TaxesPage),
      },
      {
        path: 'families',
        loadComponent: () => import('./families/families.page').then((m) => m.FamiliesPage),
      },
    ],
  },
];
