import { PaymentFailed } from './components/payment-failed/payment-failed';
import { PaymentSuccess } from './components/payment-success/payment-success';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { CompleteProfile } from './components/complete-profile/complete-profile';
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
import { UpdateProfile } from './components/update-profile/update-profile';
import { Verification } from './components/verification/verification';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Subscription } from './components/subscription/subscription';
import { ReviewList } from './components/review-list/review-list';
import { Recommendations } from './components/recommendations/recommendations';
import { Chatbot } from './components/chatbot/chatbot';

export const routes: Routes = [
  // Public routes
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'login/callback', component: LoginCallback },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'faq', component: Faq },
  { path: 'terms-privacy', component: TermsPrivacy },
  { path: 'chatbot', component: Chatbot },

  // Offers
  { path: 'offers', component: BrowseOffers },
  { path: 'offer-details/:id', component: OfferDetails },
  { path: 'my-offers', component: MyOffers, canActivate: [authGuard] },
  { path: 'create-offer', component: CreateOffer, canActivate: [authGuard] },
  { path: 'edit-offer/:id', component: EditOffer, canActivate: [authGuard] },
  // Recommendations
  { path: 'recommendations', component: Recommendations, canActivate: [authGuard] },

  // Barters
  { path: 'my-barters', component: MyBarters, canActivate: [authGuard] },
  { path: 'barter-details/:id', component: BarterDetails, canActivate: [authGuard] },
  { path: 'start-barter', component: StartBarter, canActivate: [authGuard] },

  // User
  { path: 'notifications', component: Notifications, canActivate: [authGuard] },
  { path: 'complete-profile', component: CompleteProfile, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'update-profile', component: UpdateProfile, canActivate: [authGuard] },

  { path: 'id-verification', component: Verification, canActivate: [authGuard] },

  //Subscriptions
  { path: 'subscription', component: Subscription },
  { path: 'payment-success', component: PaymentSuccess },
  { path: 'payment-failed', component: PaymentFailed },

  //reviews
  { path: 'my-reviews', component: ReviewList, canActivate: [authGuard] },

  // Admin
  { path: 'dashboard', component: AdminDashboard, canActivate: [adminGuard] },

  // Fallback
  { path: '**', component: Notfound },
];
