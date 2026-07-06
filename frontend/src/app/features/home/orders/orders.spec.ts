import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule }       from '@angular/router/testing';
import { HttpClientTestingModule,
         HttpTestingController }     from '@angular/common/http/testing';
import { signal }                    from '@angular/core';
import { provideMockStore }          from '@ngrx/store/testing';
import { ToastrModule }              from 'ngx-toastr';
import { vi }                        from 'vitest';
import { OrderService }              from '../../../services/order.service';
import { OrdersComponent }           from './orders';
import { AuthService }               from '../../../core/auth/services/auth-service';
import { UserListsService }          from '../../../services/user-lists.service';
import { environment }               from '../../../../environments/environment';

// ── Constants ──────────────────────────────────────────────────────────────
const TEST_USER_ID = 'user-abc-123';
const ORDERS_URL   = `${environment.apiUrl}/orders/${TEST_USER_ID}`;

// ── Mocks ──────────────────────────────────────────────────────────────────
const mockAuthService = {
  user: { sub: TEST_USER_ID, name: 'Alice', email: 'alice@test.com', picture: '' },
};

// Mock UserListsService so Header makes NO real HTTP calls
const mockUserListsService = {
  cartCount:      signal(0),
  wishlistCount:  signal(0),
  loadAll:        vi.fn(),
  clear:          vi.fn(),
};

const mockOrder = {
  _id: 'order1', paymentIntentId: 'pi_test_abcdefgh',
  amount: 149.99, status: 'paid', createdAt: new Date().toISOString(),
  items: [{ name: 'Phone', price: 149.99, quantity: 1, thumbnail: '' }],
};

const initialState = {
  auth: { user: mockAuthService.user, token: null,
          loading: false, error: null, sessionRestored: true },
};

// ── Flush helpers ──────────────────────────────────────────────────────────
const flushOrders = (m: HttpTestingController, orders = [mockOrder]) =>
  m.expectOne(ORDERS_URL).flush({ success: true, orders });

const flushEmpty = (m: HttpTestingController) =>
  m.expectOne(ORDERS_URL).flush({ success: true, orders: [] });

const flushError = (m: HttpTestingController) =>
  m.expectOne(ORDERS_URL)
   .flush('Error', { status: 500, statusText: 'Server Error' });

// Drain any unexpected requests (cart/wishlist from Header child components)
const drainRemaining = (m: HttpTestingController) =>
  m.match(() => true).forEach(r => { if (!r.cancelled) r.flush({}); });

// ─────────────────────────────────────────────────────────────────────────
describe('OrdersComponent', () => {
  let fixture:   ComponentFixture<OrdersComponent>;
  let component: OrdersComponent;
  let httpMock:  HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrdersComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        OrderService,
        provideMockStore({ initialState }),
        { provide: AuthService,      useValue: mockAuthService      },
        { provide: UserListsService, useValue: mockUserListsService }, // ← no HTTP calls
      ],
    }).compileComponents();

    httpMock  = TestBed.inject(HttpTestingController);
    fixture   = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
  });

  // ── Reset always runs even when verify() throws ────────────────────────
  afterEach(() => {
    drainRemaining(httpMock);          // flush any leftover cart/wishlist requests
    try    { httpMock.verify();  }
    finally { TestBed.resetTestingModule(); }
  });

  it('should create', () => {
    fixture.detectChanges();
    flushEmpty(httpMock);
    expect(component).toBeTruthy();
  });

  it('should show loading skeleton on init', () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.querySelector('.animate-pulse')).not.toBeNull();
    flushEmpty(httpMock);
  });

  it('should show empty state when no orders returned', () => {
    fixture.detectChanges();
    flushEmpty(httpMock);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No orders');
  });

  it('should render order list when orders returned', () => {
    fixture.detectChanges();
    flushOrders(httpMock);
    fixture.detectChanges();
    expect(component.orders().length).toBe(1);
  });

  it('should display order amount', () => {
    fixture.detectChanges();
    flushOrders(httpMock);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('149');
  });

  it('should display short order ID from paymentIntentId', () => {
    fixture.detectChanges();
    flushOrders(httpMock);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ABCDEFGH');
  });

  it('statusClass() should return green class for paid status', () => {
    fixture.detectChanges();
    flushEmpty(httpMock);
    expect(component.statusClass('paid')).toContain('green');
  });

  it('statusClass() should return yellow class for pending', () => {
    fixture.detectChanges();
    flushEmpty(httpMock);
    expect(component.statusClass('pending')).toContain('yellow');
  });

  it('should set error message on API failure', () => {
    fixture.detectChanges();
    flushError(httpMock);
    fixture.detectChanges();
    expect(component.errorMessage()).toBeTruthy();
  });
});
