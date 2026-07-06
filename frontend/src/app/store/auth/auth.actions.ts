import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AppUser } from '../../core/auth/services/auth-service';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Restore Session Success': props<{ user: AppUser; token: string | null }>(),
    'Restore Session Failure': emptyProps(),

    'Login With Google': props<{ credential: string }>(),
    'Login With Google Success': props<{ user: AppUser; token: string }>(),
    'Login With Google Failure': props<{ error: string }>(),

    'Login With Email': props<{ email: string; password: string }>(),
    'Login With Email Success': props<{ user: AppUser; token: string }>(),
    'Login With Email Failure': props<{ error: string }>(),

    'Login As Guest':         props<{ name: string; phone: string }>(),
    'Login As Guest Success': props<{ user: AppUser; token: string }>(),
    'Login As Guest Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout Success': emptyProps(),
  },
});
