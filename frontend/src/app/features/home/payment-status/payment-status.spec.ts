import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule }       from '@angular/router/testing';
import { ActivatedRoute }            from '@angular/router';
import { signal }                    from '@angular/core';
import { provideMockStore }          from '@ngrx/store/testing';
import { ToastrModule }              from 'ngx-toastr';
import { vi }                        from 'vitest';
import { PaymentStatusComponent }    from './payment-status';
import { UserListsService }          from '../../../services/user-lists.service';

const initialState = {
  auth: { user: null, token: null, loading: false, error: null, sessionRestored: true },
};

function createMockLists() {
  return {
    cartItems:     signal([]),
    cartCount:     signal(0),
    wishlistCount: signal(0),
    clearCart:     vi.fn(),
    loadAll:       vi.fn(),
    clear:         vi.fn(),
  };
}

// ── Complete ActivatedRoute mock covering all access patterns ─────────────
function makeRoute(status: 'success' | 'cancel') {
  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        queryParams:   { status },                              // ← plain object
        queryParamMap: {
          get: (k: string) => k === 'status' ? status : null,  // ← Map-style
        },
        params:       {},
        paramMap:     { get: () => null },
      },
      queryParams:    { subscribe: vi.fn() },
      queryParamMap:  { subscribe: vi.fn() },
    },
  };
}

const setup = async (status: 'success' | 'cancel') => {
  const mockLists = createMockLists();
  await TestBed.configureTestingModule({
    imports: [
      PaymentStatusComponent,
      RouterTestingModule,
      ToastrModule.forRoot(),
    ],
    providers: [
      provideMockStore({ initialState }),
      { provide: UserListsService, useValue: mockLists },
      makeRoute(status),
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(PaymentStatusComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component, mockLists };
};

describe('PaymentStatusComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    const { component } = await setup('success');
    expect(component).toBeTruthy();
  });

  it('should show success state when status=success', async () => {
    const { fixture } = await setup('success');
    expect(fixture.nativeElement.textContent).toContain('Payment Successful');
  });

  it('should show Continue Shopping button on success', async () => {
    const { fixture } = await setup('success');
    expect(fixture.nativeElement.textContent).toContain('Continue Shopping');
  });

  it('should show failure state when status=cancel', async () => {
    const { fixture } = await setup('cancel');
    expect(fixture.nativeElement.textContent).toContain('Payment Failed');
  });

  it('should show Try Again button on failure', async () => {
    const { fixture } = await setup('cancel');
    expect(fixture.nativeElement.textContent).toContain('Try Again');
  });

  it('should call clearCart on success status', async () => {
    const { mockLists } = await setup('success');
    expect(mockLists.clearCart).toHaveBeenCalled();
  });
});
