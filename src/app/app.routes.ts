import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'entry',
    loadComponent: () => import('./pages/entry/entry.component').then(m => m.EntryComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'absent',
    loadComponent: () => import('./pages/absent/absent.component').then(m => m.AbsentComponent)
  },
  {
    path: 'commission',
    loadComponent: () => import('./pages/commission/commission.component').then(m => m.CommissionComponent)
  },
  {
    path: 'dev',
    loadComponent: () => import('./pages/dev/dev.component').then(m => m.DevComponent)
  }
];
