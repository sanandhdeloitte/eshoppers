import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule }       from '@angular/router/testing';
import { signal }                    from '@angular/core';
import { vi }                        from 'vitest';
import { ProductCardComponent }      from './product-card';
import { UserListsService }          from '../../../services/user-lists.service';
import { Product }                   from '../../../core/models/product.model';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 1, title: 'Wireless Headphones', name: 'Wireless Headphones',
  description: 'Great headphones', price: 29.99, category: 'Electronics',
  image: 'https://example.com/img.jpg', thumbnail: 'https://example.com/thumb.jpg',
  rating: 4.5, stock: 10,
};

function createMockLists() {
  return {
    isInWishlist:    vi.fn().mockReturnValue(false),
    toggleWishlist:  vi.fn(),
    addToCart:       vi.fn(),
    getCartQuantity: vi.fn().mockReturnValue(0),
    cartCount:       signal(0),
    wishlistCount:   signal(0),
    loadAll:         vi.fn(),
    clear:           vi.fn(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('ProductCardComponent — minimal', () => {
  let fixture:   ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;
  let mockLists: ReturnType<typeof createMockLists>;

  beforeEach(async () => {
    mockLists = createMockLists();

    await TestBed.configureTestingModule({
      imports:   [ProductCardComponent, RouterTestingModule],
      providers: [{ provide: UserListsService, useValue: mockLists }],
    }).compileComponents();

    fixture   = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
  });

  // ── 1. Component creation ─────────────────────────────────────────────────
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── 2. Skeleton mode ──────────────────────────────────────────────────────
  it('should render skeleton when skeleton=true', () => {
    component.skeleton = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('should NOT render product content in skeleton mode', () => {
    component.skeleton = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.group')).toBeNull();
  });

  // ── 3. Null product ───────────────────────────────────────────────────────
  it('should render nothing when product is null', () => {
    component.product  = null;
    component.skeleton = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('article')).toBeNull();
  });

  // ── 4. Product rendering ──────────────────────────────────────────────────
  it('should render product title, category and price', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Wireless Headphones');
    expect(text).toContain('Electronics');
    expect(text).toContain('$30');               // currency pipe '1.0-0'
  });

  it('should render image with correct src and alt', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('example.com/img.jpg');
    expect(img.alt).toBe('Wireless Headphones');
  });

  it('should have a router link pointing to /products/1', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.some(a => a.getAttribute('href')?.includes('/products/1'))).toBe(true);
  });

  // ── 5. Wishlist ───────────────────────────────────────────────────────────
  it('isWishlisted() should reflect the service value', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    mockLists.isInWishlist.mockReturnValue(true);
    expect(component.isWishlisted()).toBe(true);
  });

  it('toggleWishlist() should call service with product', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    component.toggleWishlist(new MouseEvent('click'));
    expect(mockLists.toggleWishlist).toHaveBeenCalledWith(mockProduct);
  });

  it('toggleWishlist() should NOT call service when product is null', () => {
    component.product = null;
    fixture.detectChanges();
    component.toggleWishlist(new MouseEvent('click'));
    expect(mockLists.toggleWishlist).not.toHaveBeenCalled();
  });

  it('wishlist aria-label should change based on wishlisted state', () => {
    // not wishlisted
    component.product = mockProduct;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[aria-label]');
    expect(btn?.getAttribute('aria-label')).toBe('Add to wishlist');
  });

  // ── 6. Cart ───────────────────────────────────────────────────────────────
  it('cartQty() should return quantity from service', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    mockLists.getCartQuantity.mockReturnValue(3);
    expect(component.cartQty()).toBe(3);
  });

  it('addToCart() should call service with product and quantity 1', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    component.addToCart(new MouseEvent('click'));
    expect(mockLists.addToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it('addToCart() should NOT call service when product is null', () => {
    component.product = null;
    fixture.detectChanges();
    component.addToCart(new MouseEvent('click'));
    expect(mockLists.addToCart).not.toHaveBeenCalled();
  });

  it('should show qty badge when cartQty > 0', () => {
    mockLists.getCartQuantity.mockReturnValue(2);   
    component.product = mockProduct;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('button span.ml-1');
    expect(badge?.textContent?.trim()).toBe('(2)');
  });

  // ── 7. Event propagation ──────────────────────────────────────────────────
  it('addToCart() should call preventDefault and stopPropagation', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    const event      = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    const stopSpy    = vi.spyOn(event, 'stopPropagation');
    component.addToCart(event);
    expect(preventSpy).toHaveBeenCalled();
    expect(stopSpy).toHaveBeenCalled();
  });

  it('toggleWishlist() should call preventDefault and stopPropagation', () => {
    component.product = mockProduct;
    fixture.detectChanges();
    const event      = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    const stopSpy    = vi.spyOn(event, 'stopPropagation');
    component.toggleWishlist(event);
    expect(preventSpy).toHaveBeenCalled();
    expect(stopSpy).toHaveBeenCalled();
  });
});
