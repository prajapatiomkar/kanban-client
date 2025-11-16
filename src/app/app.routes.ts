import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/boards', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'boards',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/board-list/board-list.component').then((m) => m.BoardListComponent),
  },
  {
    path: 'boards/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/board-detail/board-detail.component').then(
        (m) => m.BoardDetailComponent
      ),
  },
];
