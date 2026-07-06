import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home/home').then(m => m.Home),
  },
  {
    path: 'about',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/about/about').then(m => m.AboutComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'signup', 
    loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/cart/cart').then(m => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/checkout/checkout').then(m => m.CheckoutComponent),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/orders/orders').then(m => m.OrdersComponent),
  },
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/wishlist/wishlist').then(m => m.WishlistComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./shared/product-detail/product-detail').then(m => m.ProductDetailComponent),
  },
  {
    path: 'payment-status',
    loadComponent: () =>
      import('./features/home/payment-status/payment-status').then(m => m.PaymentStatusComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./features/home/home/home').then(m => m.Home),
  },
];
