import { authFeature, AuthState } from './auth.reducer';
import { AuthActions }            from './auth.actions';
import { AppUser }                from '../../core/auth/services/auth-service';

const reducer = authFeature.reducer;

const mockUser: AppUser = {
  sub: 'u1', name: 'John', email: 'j@t.com', picture: '',
};

const initial: AuthState = {
  user: null, token: null, loading: false,
  error: null, sessionRestored: false,
};

describe('Auth Reducer', () => {

  it('should return initial state for unknown action', () => {
    const state = reducer(undefined, { type: '@@UNKNOWN' } as any);
    expect(state).toEqual(initial);
  });

  it('restoreSessionSuccess should set user, token and sessionRestored=true', () => {
    const state = reducer(initial, AuthActions.restoreSessionSuccess({ user: mockUser, token: 'tok' }));
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('tok');
    expect(state.sessionRestored).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('restoreSessionFailure should clear user and set sessionRestored=true', () => {
    const withUser = { ...initial, user: mockUser, token: 'tok' };
    const state = reducer(withUser, AuthActions.restoreSessionFailure());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.sessionRestored).toBe(true);
  });

  it('loginWithGoogle should set loading=true and clear error', () => {
    const state = reducer(
      { ...initial, error: 'old error' },
      AuthActions.loginWithGoogle({ credential: 'cred' })
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginWithEmail should set loading=true', () => {
    const state = reducer(initial, AuthActions.loginWithEmail({ email: 'e', password: 'p' }));
    expect(state.loading).toBe(true);
  });

  it('loginWithGoogleSuccess should set user, token and loading=false', () => {
    const state = reducer(
      { ...initial, loading: true },
      AuthActions.loginWithGoogleSuccess({ user: mockUser, token: 'g-tok' })
    );
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('g-tok');
    expect(state.loading).toBe(false);
  });

  it('loginWithEmailSuccess should set user and token', () => {
    const state = reducer(initial, AuthActions.loginWithEmailSuccess({ user: mockUser, token: 'e-tok' }));
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('e-tok');
  });

  it('loginAsGuestSuccess should set guest user', () => {
    const guestUser = { ...mockUser, isGuest: true };
    const state = reducer(initial, AuthActions.loginAsGuestSuccess({ user: guestUser, token: 'g' }));
    expect(state.user?.isGuest).toBe(true);
  });

  it('loginWithGoogleFailure should set error and loading=false', () => {
    const state = reducer(
      { ...initial, loading: true },
      AuthActions.loginWithGoogleFailure({ error: 'Google error' })
    );
    expect(state.error).toBe('Google error');
    expect(state.loading).toBe(false);
  });

  it('loginWithEmailFailure should set error', () => {
    const state = reducer(initial, AuthActions.loginWithEmailFailure({ error: 'Bad creds' }));
    expect(state.error).toBe('Bad creds');
    expect(state.loading).toBe(false);
  });

  it('loginAsGuestFailure should set error', () => {
    const state = reducer(initial, AuthActions.loginAsGuestFailure({ error: 'Guest failed' }));
    expect(state.error).toBe('Guest failed');
  });

  it('logoutSuccess should reset to initial state with sessionRestored=true', () => {
    const loggedIn = { user: mockUser, token: 'tok', loading: false, error: null, sessionRestored: true };
    const state = reducer(loggedIn, AuthActions.logoutSuccess());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.sessionRestored).toBe(true);
  });
});
