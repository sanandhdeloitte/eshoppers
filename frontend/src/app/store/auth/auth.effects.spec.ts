import { TestBed }            from '@angular/core/testing';
import { Router }             from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';
import { vi }                 from 'vitest';
import { AuthEffects }        from './auth.effects';
import { AuthActions }        from './auth.actions';
import { AuthService }        from '../../core/auth/services/auth-service';
import { UserService }        from '../../core/auth/services/user.service';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockUser  = { sub: 'u1', name: 'Alice', email: 'alice@test.com', picture: '' };
const mockToken = 'jwt-token-abc';

const mockAuthService = {
  user:             mockUser,
  token:            mockToken,
  signInWithGoogle: vi.fn(),
  signInWithEmail:  vi.fn(),
  signInAsGuest:    vi.fn(),
  logout:           vi.fn(),
};

const mockUserService = {
  loginUser:  vi.fn(),
  guestLogin: vi.fn(),
};

// ─────────────────────────────────────────────────────────────────────────
describe('AuthEffects', () => {
  let effects:  AuthEffects;
  let actions$: Observable<any>;
  let router:   Router;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.resetAllMocks();
    mockAuthService.user  = mockUser;
    mockAuthService.token = mockToken;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    });

    effects = TestBed.inject(AuthEffects);
    router  = TestBed.inject(Router);
  });

  afterEach(() => TestBed.resetTestingModule());

  // ── loginWithGoogle$ ───────────────────────────────────────────────────
  describe('loginWithGoogle$', () => {
    it('should dispatch loginWithGoogleSuccess on valid credential', async () => {
      mockAuthService.signInWithGoogle.mockResolvedValue(undefined);
      actions$ = of(AuthActions.loginWithGoogle({ credential: 'google-cred' }));

      const action = await firstValueFrom(effects.loginWithGoogle$);

      expect(action).toEqual(
        AuthActions.loginWithGoogleSuccess({ user: mockUser, token: mockToken })
      );
    });

    it('should dispatch loginWithGoogleFailure when signIn throws', async () => {
      mockAuthService.signInWithGoogle.mockRejectedValue(new Error('Google error'));
      actions$ = of(AuthActions.loginWithGoogle({ credential: 'bad-cred' }));

      const action = await firstValueFrom(effects.loginWithGoogle$);

      expect(action).toEqual(
        AuthActions.loginWithGoogleFailure({ error: 'Google error' })
      );
    });
  });

  // ── loginWithEmail$ ────────────────────────────────────────────────────
  describe('loginWithEmail$', () => {
    it('should dispatch loginWithEmailSuccess on valid credentials', async () => {
      mockUserService.loginUser.mockReturnValue(
        of({ user: mockUser, token: mockToken })
      );
      mockAuthService.signInWithEmail.mockResolvedValue(undefined);
      actions$ = of(
        AuthActions.loginWithEmail({ email: 'alice@test.com', password: 'pass123' })
      );

      const action = await firstValueFrom(effects.loginWithEmail$);

      expect(action).toEqual(
        AuthActions.loginWithEmailSuccess({ user: mockUser, token: mockToken })
      );
    });

    it('should dispatch loginWithEmailFailure with "User not found" on 404', async () => {
      mockUserService.loginUser.mockReturnValue(
        throwError(() => ({ status: 404 }))
      );
      actions$ = of(
        AuthActions.loginWithEmail({ email: 'x@test.com', password: 'p' })
      );

      const action = await firstValueFrom(effects.loginWithEmail$);

      expect(action).toEqual(
        AuthActions.loginWithEmailFailure({ error: 'User not found' })
      );
    });

    it('should dispatch loginWithEmailFailure with "Incorrect password" on 401', async () => {
      mockUserService.loginUser.mockReturnValue(
        throwError(() => ({ status: 401 }))
      );
      actions$ = of(
        AuthActions.loginWithEmail({ email: 'x@test.com', password: 'wrong' })
      );

      const action = await firstValueFrom(effects.loginWithEmail$);

      expect(action).toEqual(
        AuthActions.loginWithEmailFailure({ error: 'Incorrect password' })
      );
    });

    it('should dispatch loginWithEmailFailure with "Login failed" for unknown errors', async () => {
      mockUserService.loginUser.mockReturnValue(
        throwError(() => ({ status: 500 }))
      );
      actions$ = of(
        AuthActions.loginWithEmail({ email: 'x@test.com', password: 'p' })
      );

      const action = await firstValueFrom(effects.loginWithEmail$);

      expect(action).toEqual(
        AuthActions.loginWithEmailFailure({ error: 'Login failed' })
      );
    });
  });

  // ── loginAsGuest$ ──────────────────────────────────────────────────────
  describe('loginAsGuest$', () => {
    it('should dispatch loginAsGuestSuccess on valid guest data', async () => {
      mockUserService.guestLogin.mockReturnValue(
        of({ user: mockUser, token: mockToken })
      );
      mockAuthService.signInAsGuest.mockResolvedValue(undefined);
      actions$ = of(AuthActions.loginAsGuest({ name: 'Bob', phone: '1234567890' }));

      const action = await firstValueFrom(effects.loginAsGuest$);

      expect(action).toEqual(
        AuthActions.loginAsGuestSuccess({ user: mockUser, token: mockToken })
      );
    });

    it('should dispatch loginAsGuestFailure on service error', async () => {
      mockUserService.guestLogin.mockReturnValue(
        throwError(() => new Error('fail'))
      );
      actions$ = of(AuthActions.loginAsGuest({ name: 'Bob', phone: '000' }));

      const action = await firstValueFrom(effects.loginAsGuest$);

      expect(action).toEqual(
        AuthActions.loginAsGuestFailure({ error: 'Guest login failed' })
      );
    });
  });

  // ── redirectAfterLogin$ ────────────────────────────────────────────────
  describe('redirectAfterLogin$', () => {
    it('should navigate to /home on loginWithEmailSuccess', async () => {
      const spy = vi.spyOn(router, 'navigate');
      actions$  = of(
        AuthActions.loginWithEmailSuccess({ user: mockUser, token: mockToken })
      );

      await firstValueFrom(effects.redirectAfterLogin$);

      expect(spy).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to /home on loginWithGoogleSuccess', async () => {
      const spy = vi.spyOn(router, 'navigate');
      actions$  = of(
        AuthActions.loginWithGoogleSuccess({ user: mockUser, token: mockToken })
      );

      await firstValueFrom(effects.redirectAfterLogin$);

      expect(spy).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to /home on loginAsGuestSuccess', async () => {
      const spy = vi.spyOn(router, 'navigate');
      actions$  = of(
        AuthActions.loginAsGuestSuccess({ user: mockUser, token: mockToken })
      );

      await firstValueFrom(effects.redirectAfterLogin$);

      expect(spy).toHaveBeenCalledWith(['/home']);
    });
  });

  // ── logout$ ────────────────────────────────────────────────────────────
  describe('logout$', () => {
    it('should dispatch logoutSuccess after service logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      actions$ = of(AuthActions.logout());

      const action = await firstValueFrom(effects.logout$);

      expect(action).toEqual(AuthActions.logoutSuccess());
    });
  });

  // ── redirectAfterLogout$ ───────────────────────────────────────────────
  describe('redirectAfterLogout$', () => {
    it('should navigate to /login after logoutSuccess', async () => {
      const spy = vi.spyOn(router, 'navigate');
      actions$  = of(AuthActions.logoutSuccess());

      await firstValueFrom(effects.redirectAfterLogout$);

      expect(spy).toHaveBeenCalledWith(['/login']);
    });
  });
});
