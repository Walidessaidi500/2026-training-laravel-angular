import { Routes } from '@angular/router';
import { RegisterComponent } from './features/user/register/register.component';
import { LoginComponent } from './features/user/login/login.component';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/core/home/home.page').then((m) => m.HomePage),
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
