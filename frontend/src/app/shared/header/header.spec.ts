import { ComponentFixture, TestBed }   from '@angular/core/testing';
import { RouterTestingModule }         from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { signal }                      from '@angular/core';
import { vi }                          from 'vitest';
import { Header }                      from './header';
import { UserListsService }            from '../../services/user-lists.service';
import { SearchService }               from '../../services/search.service';
import { AuthActions }                 from '../../store/auth/auth.actions';

const initialState = {
  auth: { user: null, token: null, loading: false, error: null, sessionRestored: true },
};

const loggedIn = {
  auth: { ...initialState.auth,
    user: { sub: 'u1', name: 'Alice', email: 'a@b.com', picture: '' } },
};

describe('Header', () => {
  let fixture:    ComponentFixture<Header>;
  let component:  Header;
  let store:      MockStore;
  let mockLists:  ReturnType<typeof makeMockLists>;
  let mockSearch: ReturnType<typeof makeMockSearch>;

  function makeMockLists(cartCount = 0) {
    return {
      cartCount:     signal(cartCount),
      wishlistCount: signal(0),
      loadAll:       vi.fn(),
      clear:         vi.fn(),
    };
  }
  function makeMockSearch() {
    return { term: signal(''), update: vi.fn(), reset: vi.fn() };
  }

  const setup = async (stateOverride = {}, cartCount = 0) => {
    mockLists  = makeMockLists(cartCount);   // ← pass cartCount into factory
    mockSearch = makeMockSearch();

    await TestBed.configureTestingModule({
      imports:   [Header, RouterTestingModule],
      providers: [
        provideMockStore({ initialState: { ...initialState, ...stateOverride } }),
        { provide: UserListsService, useValue: mockLists  },
        { provide: SearchService,    useValue: mockSearch },
      ],
    }).compileComponents();

    store     = TestBed.inject(MockStore);
    fixture   = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should show Sign In button when user is null', async () => {
    await setup();
    expect(fixture.nativeElement.textContent).toContain('Sign In');
  });

  it('should NOT show Logout button when user is null', async () => {
    await setup();
    const btns = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    expect(btns.some(b => b.textContent?.includes('Logout'))).toBe(false);
  });

  it('should show user name when logged in', async () => {
    await setup(loggedIn);
    expect(fixture.nativeElement.textContent).toContain('Alice');
  });

  it('should show Logout button when logged in', async () => {
    await setup(loggedIn);
    const btns = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    expect(btns.some(b => b.textContent?.trim().includes('Logout'))).toBe(true);
  });

  it('logout() should dispatch AuthActions.logout', async () => {
    await setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.logout();
    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.logout());
  });

  // ── Cart badge: pass cartCount=3 directly into setup ──────────────────
  it('should show cart badge when cartCount > 0', async () => {
    await setup(loggedIn, 3);            // ← signal initialised with 3
    expect(fixture.nativeElement.textContent).toContain('3');
  });

  it('profileClicked() should emit onprofileClick', async () => {
    await setup(loggedIn);
    const spy = vi.fn();
    component.onprofileClick.subscribe(spy);
    component.profileClicked();
    expect(spy).toHaveBeenCalled();
  });
});
