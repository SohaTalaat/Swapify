import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { CompleteProfile } from './components/complete-profile/complete-profile';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Notfound } from './components/notfound/notfound';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'complete-profile', component: CompleteProfile },
  { path: 'dashbord', component: AdminDashboard },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
{path: 'profile-page' , component: ProfilePage}
  { path: '**', component: Notfound },
];
