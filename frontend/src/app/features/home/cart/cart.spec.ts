import { ComponentFixture, TestBed }   from '@angular/core/testing';
import { RouterTestingModule }         from '@angular/router/testing';
import { Router }                      from '@angular/router';
import { signal }                      from '@angular/core';
import { provideMockStore }            from '@ngrx/store/testing';
import { vi }                          from 'vitest';
import { CartComponent }               from './cart';
import { UserListsService,
         CartItem }                    from '../../../services/user-lists.service';

const makeItem = (id: number, qty = 1): CartItem => ({
  productId: id, name: `Item ${id}`, price: 10,
  quantity: qty, thumbnail: '', stock: 5,
});

const initialState = {
  auth: { user: null, token: null, loading: false, error: null, sessionRestored: true },
};

function createMockLists(items: CartItem[] = []) {
  return {
    cartItems:      signal(items),
    cartCount:      signal(items.reduce((s, i) => s + i.quantity, 0)),
    wishlistCount:  signal(0),
    loadAll:        vi.fn(),
    clear:          vi.fn(),
    clearCart:      vi.fn(),
    removeFromCart: vi.fn(),
    updateCart:     vi.fn(),
    addToCart:      vi.fn(),
  };
}

describe('CartComponent', () => {
  let fixture:   ComponentFixture<CartComponent>;
  let component: CartComponent;
  let mockLists: ReturnType<typeof createMockLists>;
  let router:    Router;

  const setup = async (items: CartItem[] = []) => {
    mockLists = createMockLists(items);
    await TestBed.configureTestingModule({
      imports:   [CartComponent, RouterTestingModule],
      providers: [
        provideMockStore({ initialState }),           // ← Store fix
        { provide: UserListsService, useValue: mockLists },
      ],
    }).compileComponents();
    router    = TestBed.inject(Router);
    fixture   = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should show empty state when cart is empty', async () => {
    await setup([]);
    expect(fixture.nativeElement.textContent).toContain('Your cart is empty');
  });

  it('should render cart items when present', async () => {
    await setup([makeItem(1), makeItem(2)]);
    expect(fixture.nativeElement.textContent).toContain('Item 1');
    expect(fixture.nativeElement.textContent).toContain('Item 2');
  });

  it('totalAmount() should sum price * quantity', async () => {
    await setup([makeItem(1, 2), makeItem(2, 3)]);
    expect(component.totalAmount()).toBe(50);   // (10*2)+(10*3)
  });

  it('totalAmount() should be 0 for empty cart', async () => {
    await setup([]);
    expect(component.totalAmount()).toBe(0);
  });

  it('remove() should call service removeFromCart', async () => {
    await setup([makeItem(1)]);
    component.remove(1);
    expect(mockLists.removeFromCart).toHaveBeenCalledWith(1);
  });

  it('increase() should call updateCart with qty+1', async () => {
    await setup([makeItem(1, 2)]);
    component.increase(1, 2);
    expect(mockLists.updateCart).toHaveBeenCalledWith(1, 3);
  });

  it('decrease() should call removeFromCart when qty is 1', async () => {
    await setup([makeItem(1, 1)]);
    component.decrease(1, 1);
    expect(mockLists.removeFromCart).toHaveBeenCalledWith(1);
  });

  it('decrease() should call updateCart with qty-1 when qty > 1', async () => {
    await setup([makeItem(1, 3)]);
    component.decrease(1, 3);
    expect(mockLists.updateCart).toHaveBeenCalledWith(1, 2);
  });

  it('proceedToCheckout() should navigate to /checkout', async () => {
    await setup([makeItem(1)]);
    const navSpy = vi.spyOn(router, 'navigate');
    component.proceedToCheckout();
    expect(navSpy).toHaveBeenCalledWith(['/checkout']);
  });
});
