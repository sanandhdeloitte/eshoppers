import { TestBed }                from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { EMPTY }                  from 'rxjs';
import { vi }                     from 'vitest';
import { provideMockStore }       from '@ngrx/store/testing';   // ← add
import { authInterceptor }        from './auth-interceptor';
import { AuthService }            from '../services/auth-service';
import { Router }                 from '@angular/router';

const TEST_URL   = 'http://localhost:3000/api/test';
const GOOGLE_URL = 'https://accounts.google.com/token';

function makeNext() {
  const spy = vi.fn().mockReturnValue(EMPTY);
  const nextFn: HttpHandlerFn = (req) => spy(req);
  return { spy, nextFn };
}

describe('authInterceptor', () => {
  let mockAuth: { token: string | null };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuth  = { token: null };
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: Router,      useValue: routerSpy },
        provideMockStore({}),    
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should attach Authorization header when token exists', () => {
    mockAuth.token = 'test-token';
    const { spy, nextFn } = makeNext();
    const req = new HttpRequest('GET', TEST_URL);
    TestBed.runInInjectionContext(() => authInterceptor(req, nextFn));
    const forwarded: HttpRequest<unknown> = spy.mock.calls[0][0];
    expect(forwarded.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('should pass request through without header when no token', () => {
    mockAuth.token = null;
    const { spy, nextFn } = makeNext();
    const req = new HttpRequest('GET', TEST_URL);
    TestBed.runInInjectionContext(() => authInterceptor(req, nextFn));
    const forwarded: HttpRequest<unknown> = spy.mock.calls[0][0];
    expect(forwarded.headers.has('Authorization')).toBe(false);
  });

  it('should bypass interceptor for Google OAuth URLs', () => {
    mockAuth.token = 'test-token';
    const { spy, nextFn } = makeNext();
    const req = new HttpRequest('GET', GOOGLE_URL);
    TestBed.runInInjectionContext(() => authInterceptor(req, nextFn));
    const forwarded: HttpRequest<unknown> = spy.mock.calls[0][0];
    expect(forwarded.headers.has('Authorization')).toBe(false);
  });

  it('should not mutate the original request object', () => {
    mockAuth.token = 'test-token';
    const { spy, nextFn } = makeNext();
    const req = new HttpRequest('GET', TEST_URL);
    TestBed.runInInjectionContext(() => authInterceptor(req, nextFn));
    const forwarded: HttpRequest<unknown> = spy.mock.calls[0][0];
    expect(forwarded).not.toBe(req);
    expect(req.headers.has('Authorization')).toBe(false);
  });
});
