import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { CompleteProfile } from './components/complete-profile/complete-profile';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { ProfilePage } from './components/profile-page/profile-page';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'complete-profile', component: CompleteProfile },
  { path: 'dashbord', component: AdminDashboard },









  { path: 'profile-page', component: ProfilePage },

  { path: '**', redirectTo: '' },
];
