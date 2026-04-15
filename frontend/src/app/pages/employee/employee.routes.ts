import { Routes } from '@angular/router';
import { EmployeeLayoutComponent } from './layout/employee-layout.component';

export const EMPLOYEE_ROUTES: Routes = [
    {
        path: '',
        component: EmployeeLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'tpv',
                pathMatch: 'full',
            },
            {
                path: 'tpv',
                loadComponent: () => import('./tpv/tpv.page').then((m) => m.TpvPage),
            }
        ]
    }
];