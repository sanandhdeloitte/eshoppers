import { TestBed }         from '@angular/core/testing';
import { Router,
         UrlTree }         from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PLATFORM_ID }    from '@angular/core';
import { vi }             from 'vitest';
import { authGuard }      from './auth-guard';
import { AuthService }    from '../services/auth-service';

function runGuard(
  user: any,
  platform: string = 'browser'
): ReturnType<typeof authGuard> {
  TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
      { provide: AuthService,   useValue: { user } },
      { provide: PLATFORM_ID,   useValue: platform },
    ],
  });
  return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
}

describe('authGuard', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should return true when user is logged in', () => {
    const result = runGuard({ sub: 'u1', name: 'John', email: '', picture: '' });
    expect(result).toBe(true);
  });

  it('should redirect to /login when user is null', () => {
    const result = runGuard(null);
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain('/login');
  });

  it('should include reason=login-required query param', () => {
    const result = runGuard(null) as UrlTree;
    expect(result.queryParams['reason']).toBe('login-required');
  });

  it('should return true on server platform regardless of user', () => {
    const result = runGuard(null, 'server');
    expect(result).toBe(true);
  });
});
