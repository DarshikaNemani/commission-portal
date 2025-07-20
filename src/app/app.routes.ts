import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EntryComponent } from './pages/entry/entry.component';
import { LoginComponent } from './pages/login/login.component';
import { AbsentComponent } from './pages/absent/absent.component';
import { CommissionComponent } from './pages/commission/commission.component';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'entry',
    component: EntryComponent,
  },
  {
    path: 'admin',
    component: LoginComponent
  },
  {
    path: 'absent',
    component: AbsentComponent
  },
  {
    path:'commission',
    component:CommissionComponent
  }
];
