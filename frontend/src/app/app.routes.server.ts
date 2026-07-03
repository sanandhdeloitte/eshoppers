import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
   { path: 'login',          renderMode: RenderMode.Client },
  { path: 'signup',         renderMode: RenderMode.Client },

   { path: 'about',          renderMode: RenderMode.Client },

   { path: 'home',           renderMode: RenderMode.Client },
  { path: 'products/:id',   renderMode: RenderMode.Client }, 
  { path: 'cart',           renderMode: RenderMode.Client },
  { path: 'wishlist',       renderMode: RenderMode.Client },
  { path: 'checkout',       renderMode: RenderMode.Client },
  { path: 'payment-status', renderMode: RenderMode.Client },
  { path: 'orders',         renderMode: RenderMode.Client },

   { path: '**',             renderMode: RenderMode.Client },
];
