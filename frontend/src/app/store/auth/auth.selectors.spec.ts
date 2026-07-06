import { selectUser, selectToken, selectAuthLoading,
         selectAuthError, selectIsLoggedIn,
         selectSessionRestored } from './auth.selectors';
import { AppUser }               from '../../core/auth/services/auth-service';

const mockUser: AppUser = { sub: 'u1', name: 'John', email: 'j@t.com', picture: '' };

const makeState = (overrides = {}) => ({
  auth: {
    user: null, token: null, loading: false,
    error: null, sessionRestored: false,
    ...overrides,
  },
});

describe('Auth Selectors', () => {

  it('selectUser should return null by default', () => {
    expect(selectUser(makeState())).toBeNull();
  });

  it('selectUser should return user when set', () => {
    expect(selectUser(makeState({ user: mockUser }))).toEqual(mockUser);
  });

  it('selectToken should return token', () => {
    expect(selectToken(makeState({ token: 'tok' }))).toBe('tok');
  });

  it('selectAuthLoading should return loading flag', () => {
    expect(selectAuthLoading(makeState({ loading: true }))).toBe(true);
    expect(selectAuthLoading(makeState({ loading: false }))).toBe(false);
  });

  it('selectAuthError should return error message', () => {
    expect(selectAuthError(makeState({ error: 'Oops' }))).toBe('Oops');
    expect(selectAuthError(makeState())).toBeNull();
  });

  it('selectIsLoggedIn should be false when user is null', () => {
    expect(selectIsLoggedIn(makeState())).toBe(false);
  });

  it('selectIsLoggedIn should be true when user is set', () => {
    expect(selectIsLoggedIn(makeState({ user: mockUser }))).toBe(true);
  });

  it('selectSessionRestored should reflect flag', () => {
    expect(selectSessionRestored(makeState({ sessionRestored: true }))).toBe(true);
    expect(selectSessionRestored(makeState())).toBe(false);
  });
});
