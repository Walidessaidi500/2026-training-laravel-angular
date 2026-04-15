import { Routes } from '@angular/router';
import { SupervisorLayoutComponent } from './layout/supervisor-layout.component';

export const SUPERVISOR_ROUTES: Routes = [
  {
    path: '',
    component: SupervisorLayoutComponent,
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
        loadComponent: () => import('../admin/users/users.page').then((m) => m.UsersPage),
      },
      {
        path: 'products',
        loadComponent: () => import('../admin/products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'tables',
        loadComponent: () => import('../admin/tables/tables.component').then((m) => m.TablesComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('../admin/settings/settings.component').then((m) => m.SettingsComponent),
      }
    ]
  }
];
