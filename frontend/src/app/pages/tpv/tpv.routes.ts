import { Routes } from '@angular/router';
import { TPVLayoutComponent } from './layout/tpv-layout.component';

export const TPV_ROUTES: Routes = [
    {
        path: '',
        component: TPVLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./tpv.page').then((m) => m.TpvPage),
            }
        ]
    }
];
