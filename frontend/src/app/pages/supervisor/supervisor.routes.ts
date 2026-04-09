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
      }
    ]
  }
];
