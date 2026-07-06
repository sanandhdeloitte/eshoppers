import { ComponentFixture, TestBed }   from '@angular/core/testing';
import { RouterTestingModule }         from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActivatedRoute }              from '@angular/router';
import { PLATFORM_ID }                 from '@angular/core';
import { vi }                          from 'vitest';
import { Login }                       from './login';
import { AuthActions } from '../../../store/auth/auth.actions';

const initialState = {
  auth: { user: null, token: null, loading: false, error: null, sessionRestored: true },
};

const makeRoute = (reason: string | null = null) => ({
  provide: ActivatedRoute,
  useValue: {
    snapshot: {
      queryParams:   { reason },
      queryParamMap: { get: (k: string) => k === 'reason' ? reason : null },
    },
    queryParamMap: { subscribe: vi.fn() },
  },
});

describe('Login', () => {
  let fixture:   ComponentFixture<Login>;
  let component: Login;
  let store:     MockStore;

  const setup = async (reason: string | null = null) => {
    await TestBed.configureTestingModule({
      imports:   [Login, RouterTestingModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: PLATFORM_ID, useValue: 'browser' },
        makeRoute(reason),
      ],
    }).compileComponents();
    store     = TestBed.inject(MockStore);
    fixture   = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should show email form by default', async () => {
    await setup();
    expect(component.showGuestForm()).toBe(false);
  });

  it('should show Welcome Back heading', async () => {
    await setup();
    expect(fixture.nativeElement.textContent).toContain('Welcome Back');
  });

  it('toggleGuestForm() should switch to guest form', async () => {
    await setup();
    component.toggleGuestForm();
    fixture.detectChanges();
    expect(component.showGuestForm()).toBe(true);
  });

  it('toggleGuestForm() called twice should return to email form', async () => {
    await setup();
    component.toggleGuestForm();
    component.toggleGuestForm();
    fixture.detectChanges();
    expect(component.showGuestForm()).toBe(false);
  });

  it('signin() should dispatch loginWithEmail with form values', async () => {
    await setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.form    = { email: 'a@b.com', password: 'pass123' };
    component.signin({ valid: true } as any);
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.loginWithEmail({ email: 'a@b.com', password: 'pass123' })
    );
  });

  it('signin() with empty form values should dispatch with empty strings', async () => {
    await setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.form    = { email: '', password: '' };
    component.signin({ valid: false } as any);
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.loginWithEmail({ email: '', password: '' })
    );
  });

  it('guestSignin() should dispatch loginAsGuest with form values', async () => {
    await setup();
    const dispatchSpy   = vi.spyOn(store, 'dispatch');
    component.guestForm = { name: 'Alice', phone: '1234567890' };
    component.guestSignin({ valid: true } as any);
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.loginAsGuest({ name: 'Alice', phone: '1234567890' })
    );
  });

  it('guestSignin() with empty form values should dispatch with empty strings', async () => {
    await setup();
    const dispatchSpy   = vi.spyOn(store, 'dispatch');
    component.guestForm = { name: '', phone: '' };
    component.guestSignin({ valid: false } as any);
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.loginAsGuest({ name: '', phone: '' })
    );
  });
});
