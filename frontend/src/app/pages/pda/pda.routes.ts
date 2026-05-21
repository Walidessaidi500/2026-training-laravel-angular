import { Routes } from '@angular/router';

export const PDA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/pda/pda.page').then(m => m.PdaPage)
  }
];
