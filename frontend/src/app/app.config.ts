import {
  ApplicationConfig, importProvidersFrom, inject,
  provideAppInitializer, provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  provideHttpClient, withInterceptors,
  withFetch,        
} from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser'; // ← NEW
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { Store } from '@ngrx/store';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth-interceptor';
import { authFeature } from './store/auth/auth.reducer';
import { productsFeature } from './store/products/products.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { ProductsEffects } from './store/products/products.effects';
import { AuthActions } from './store/auth/auth.actions';
import { AuthService } from './core/auth/services/auth-service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),

    provideRouter(routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),

    provideAnimations(),
    importProvidersFrom(ToastrModule.forRoot({
      positionClass:     'toast-top-right',
      timeOut:           2000,
      preventDuplicates: true,
    })),
    provideStore({
      [authFeature.name]:     authFeature.reducer,
      [productsFeature.name]: productsFeature.reducer,
    }),
    provideEffects([AuthEffects, ProductsEffects]),
    provideStoreDevtools({
      maxAge:  25,
      logOnly: environment.production,  
    }),
    provideAppInitializer(async () => {
      const store       = inject(Store);
      const authService = inject(AuthService);
      await authService.restoreSession();
      if (authService.user) {
        store.dispatch(AuthActions.restoreSessionSuccess({
          user:  authService.user,
          token: authService.token,
        }));
      } else {
        store.dispatch(AuthActions.restoreSessionFailure());
      }
    }),
  ],
};
