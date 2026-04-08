import { Routes } from '@angular/router';
import { SupervisorLayoutComponent } from './layout/supervisor-layout.component';

export const SUPERVISOR_ROUTES: Routes = [
    {
        path: '',
        component: SupervisorLayoutComponent,
        pathMatch: 'full',

    },
];
