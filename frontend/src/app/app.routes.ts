import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { CompleteProfile } from './components/complete-profile/complete-profile';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Notfound } from './components/notfound/notfound';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';
import { ProfilePage } from './components/profile-page/profile-page';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { Faq } from './components/faq/faq';
import { TermsPrivacy } from './components/terms-privacy/terms-privacy';
import { LoginCallback } from './pages/login-callback/login-callback';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { BrowseOffers } from './components/browse-offers/browse-offers';
import { OfferDetails } from './components/offer-details/offer-details';
import { MyOffers } from './components/my-offers/my-offers';
import { CreateOffer } from './components/create-offer/create-offer';
import { EditOffer } from './components/edit-offer/edit-offer';
import { MyBarters } from './components/my-barters/my-barters';
import { BarterDetails } from './components/barter-details/barter-details';
import { StartBarter } from './components/start-barter/start-barter';
import { Notifications } from './components/notifications/notifications';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'login/callback', component: LoginCallback },
  { path: 'register', component: Register },
  { path: 'offers', component: BrowseOffers, canActivate: [authGuard] },
  { path: 'OfferDetails/:id', component: OfferDetails, canActivate: [authGuard] },
  { path: 'MyOffers', component: MyOffers, canActivate: [authGuard] },
  { path: 'create-offer', component: CreateOffer, canActivate: [authGuard] },
  { path: 'edit-offer/:id', component: EditOffer, canActivate: [authGuard] },
  { path: 'my-barters', component: MyBarters, canActivate: [authGuard] },
  { path: 'barter-details/:id', component: BarterDetails, canActivate: [authGuard] },
  { path: 'start-barter', component: StartBarter, canActivate: [authGuard] },
  { path: 'notifications', component: Notifications, canActivate: [authGuard] },

  { path: 'complete-profile', component: CompleteProfile, canActivate: [authGuard] },
  { path: 'dashbord', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'faq', component: Faq },
  { path: 'terms-privacy', component: TermsPrivacy },
  { path: '**', component: Notfound },
];
