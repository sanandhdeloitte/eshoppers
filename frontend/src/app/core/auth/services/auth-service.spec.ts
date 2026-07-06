import { TestBed }     from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { vi }          from 'vitest';
import { AuthService, AppUser } from './auth-service';

const mockUser: AppUser = {
  sub: 'user-123', name: 'John Doe',
  email: 'john@test.com', picture: 'https://pic.com/john.jpg',
};

const mockToken = [
  'eyJhbGciOiJSUzI1NiJ9',
  btoa(JSON.stringify({
    sub: 'user-123', name: 'John Doe',
    email: 'john@test.com', picture: 'https://pic.com/john.jpg',
  })).replace(/=/g, ''),
  'signature',
].join('.');


describe('AuthService — browser', () => {
  let service: AuthService;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should create', () => expect(service).toBeTruthy());

  it('should start with null user and token', () => {
    expect(service.user).toBeNull();
    expect(service.token).toBeNull();
  });

  // restoreSession
  it('restoreSession() should restore user from sessionStorage', async () => {
    sessionStorage.setItem('auth_token', 'tok');
    sessionStorage.setItem('auth_user', JSON.stringify(mockUser));
    await service.restoreSession();
    expect(service.user).toEqual(mockUser);
    expect(service.token).toBe('tok');
  });

  it('restoreSession() should clear when no user in sessionStorage', async () => {
    sessionStorage.setItem('auth_token', 'tok');
    await service.restoreSession();
    expect(service.user).toBeNull();
    expect(service.token).toBeNull();
  });

  it('restoreSession() should clear on invalid JSON', async () => {
    sessionStorage.setItem('auth_user', '{bad json');
    await service.restoreSession();
    expect(service.user).toBeNull();
  });

  // signInWithGoogle
  it('signInWithGoogle() should decode JWT and store user', async () => {
    await service.signInWithGoogle(mockToken);
    expect(service.user?.sub).toBe('user-123');
    expect(service.user?.name).toBe('John Doe');
    expect(service.token).toBe(mockToken);
    expect(sessionStorage.getItem('auth_token')).toBe(mockToken);
    expect(JSON.parse(sessionStorage.getItem('auth_user')!).email).toBe('john@test.com');
  });

  // signInWithEmail
  it('signInWithEmail() should store user and token', async () => {
    await service.signInWithEmail(mockUser, 'email-token');
    expect(service.user).toEqual(mockUser);
    expect(service.token).toBe('email-token');
    expect(sessionStorage.getItem('auth_token')).toBe('email-token');
  });

  // signInAsGuest
  it('signInAsGuest() should store guest user and token', async () => {
    const guestUser: AppUser = { ...mockUser, isGuest: true };
    await service.signInAsGuest(guestUser, 'guest-token');
    expect(service.user?.isGuest).toBe(true);
    expect(service.token).toBe('guest-token');
  });

  // logout
  it('logout() should clear user, token and sessionStorage', async () => {
    await service.signInWithEmail(mockUser, 'tok');
    await service.logout();
    expect(service.user).toBeNull();
    expect(service.token).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_user')).toBeNull();
  });

  // parseJwt
  it('parseJwt() should decode payload correctly', () => {
    const payload = service.parseJwt(mockToken);
    expect(payload.sub).toBe('user-123');
    expect(payload.name).toBe('John Doe');
  });

  it('parseJwt() should throw on invalid token', () => {
    expect(() => service.parseJwt('invalid')).toThrow('Invalid JWT');
  });
});


describe('AuthService — server (non-browser)', () => {
  let service: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();
    service = TestBed.inject(AuthService);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('restoreSession() should do nothing on server', async () => {
    await service.restoreSession();
    expect(service.user).toBeNull();
    expect(service.token).toBeNull();
  });

  it('signInWithEmail() should set user but skip sessionStorage on server', async () => {
    await service.signInWithEmail(mockUser, 'tok');
    expect(service.user).toEqual(mockUser);
  });
});
