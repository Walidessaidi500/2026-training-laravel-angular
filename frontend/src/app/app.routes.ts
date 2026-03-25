import { Routes } from '@angular/router';
import { RegisterComponent } from './features/user/register/register.component';
import { LoginComponent } from './features/user/login/login.component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/core/home/home.page').then((m) => m.HomePage),
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'backoffice',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/backoffice/backoffice.component').then((m) => m.BackofficeComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/backoffice/dashboard/dashboard.component').then((m) => m.DashboardComponent) },

      { path: 'families', loadComponent: () => import('./features/admin/families/family-list/family-list.component').then((m) => m.FamilyListComponent) },
      { path: 'families/new', loadComponent: () => import('./features/admin/families/family-form/family-form.component').then((m) => m.FamilyFormComponent) },
      { path: 'families/edit/:uuid', loadComponent: () => import('./features/admin/families/family-form/family-form.component').then((m) => m.FamilyFormComponent) },

      { path: 'taxes', loadComponent: () => import('./features/admin/taxes/tax-list/tax-list.component').then((m) => m.TaxListComponent) },
      { path: 'taxes/new', loadComponent: () => import('./features/admin/taxes/tax-form/tax-form.component').then((m) => m.TaxFormComponent) },
      { path: 'taxes/edit/:uuid', loadComponent: () => import('./features/admin/taxes/tax-form/tax-form.component').then((m) => m.TaxFormComponent) },

      { path: 'products', loadComponent: () => import('./features/admin/products/product-list/product-list.component').then((m) => m.ProductListComponent) },
      { path: 'products/new', loadComponent: () => import('./features/admin/products/product-form/product-form.component').then((m) => m.ProductFormComponent) },
      { path: 'products/edit/:uuid', loadComponent: () => import('./features/admin/products/product-form/product-form.component').then((m) => m.ProductFormComponent) },

      { path: 'zones', loadComponent: () => import('./features/admin/zones/zone-list/zone-list.component').then((m) => m.ZoneListComponent) },
      { path: 'zones/new', loadComponent: () => import('./features/admin/zones/zone-form/zone-form.component').then((m) => m.ZoneFormComponent) },
      { path: 'zones/edit/:uuid', loadComponent: () => import('./features/admin/zones/zone-form/zone-form.component').then((m) => m.ZoneFormComponent) },

      { path: 'tables', loadComponent: () => import('./features/admin/tables/table-list/table-list.component').then((m) => m.TableListComponent) },
      { path: 'tables/new', loadComponent: () => import('./features/admin/tables/table-form/table-form.component').then((m) => m.TableFormComponent) },
      { path: 'tables/edit/:uuid', loadComponent: () => import('./features/admin/tables/table-form/table-form.component').then((m) => m.TableFormComponent) },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  }
];
