import { ComponentFixture, TestBed }   from '@angular/core/testing';
import { RouterTestingModule }         from '@angular/router/testing';
import { ActivatedRoute }              from '@angular/router';
import { HttpClientTestingModule }     from '@angular/common/http/testing';
import { signal }                      from '@angular/core';
import { provideMockStore }            from '@ngrx/store/testing';
import { ToastrModule }                from 'ngx-toastr';
import { of, throwError }              from 'rxjs';
import { vi }                          from 'vitest';
import { ProductDetailComponent }      from './product-detail';
import { ProductService }              from '../../services/product.service';
import { UserListsService }            from '../../services/user-lists.service';
import { Product, Review }             from '../../core/models/product.model';

const mockReview: Review = {
  id:           1,
  reviewerName: 'Alice',
  rating:       5,
  comment:      'Love it',
  createdAt:    '2024-01-01',
};

const mockProduct: Product = {
  id:          42,
  name:        'Headphones',
  description: 'Great sound',
  price:       49.99,
  stock:       10,
  category:    'Electronics',
  thumbnail:   '',
  image:       '',
  rating:      4.5,
  reviews:     [mockReview],
};

const mockProductService = { getProductById: vi.fn() };

const createMockLists = () => ({
  cartItems:       signal<any[]>([]),
  wishlistItems:   signal<any[]>([]),
  wishlistCount:   vi.fn().mockReturnValue(0),  
  cartCount:       vi.fn().mockReturnValue(0),   
  loadAll:         vi.fn(),
  addToCart:       vi.fn(),
  toggleWishlist:  vi.fn(),
  clearCart:       vi.fn(),
  isInWishlist:    vi.fn().mockReturnValue(false),
  getCartQuantity: vi.fn().mockReturnValue(0),   
});

const makeRoute = (id: string) => ({
  paramMap: of({ get: (key: string) => (key === 'id' ? id : null) }),
});

const setup = async (
  routeId              = '42',
  productServiceReturn = of({ success: true, message: 'OK', product: mockProduct }),
) => {
  TestBed.resetTestingModule();
  vi.resetAllMocks();

  const mockLists = createMockLists();
  mockProductService.getProductById.mockReturnValue(productServiceReturn);

  await TestBed.configureTestingModule({
    imports: [
      ProductDetailComponent, RouterTestingModule,
      HttpClientTestingModule, ToastrModule.forRoot(),
    ],
    providers: [
      provideMockStore(),
      { provide: ActivatedRoute,   useValue: makeRoute(routeId) },
      { provide: ProductService,   useValue: mockProductService },
      { provide: UserListsService, useValue: mockLists          },
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(ProductDetailComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component, mockLists };
};

// ─────────────────────────────────────────────────────────────────────────
describe('ProductDetailComponent', () => {

  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should set loading to false after data loads', async () => {
    const { component } = await setup();
    expect(component.loading()).toBe(false);
  });

  it('should set product signal after successful fetch', async () => {
    const { component } = await setup();
    expect(component.product()).toEqual(mockProduct);
  });

  it('should populate reviews signal from product data', async () => {
    const { component } = await setup();
    expect(component.reviews().length).toBe(1);
    expect(component.reviews()[0].reviewerName).toBe('Alice');
  });

  it('should call loadAll on init', async () => {
    const { mockLists } = await setup();
    expect(mockLists.loadAll).toHaveBeenCalled();
  });

  it('should set error message when API throws', async () => {
    const { component } = await setup('42', throwError(() => new Error('Not found')));
    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  it('should set error message on null product response', async () => {
    const { component } = await setup(
      '42',
      of({ success: false, message: 'Not found', product: null } as any)
    );
    expect(component.error()).toBeTruthy();
  });

  it('should set error for invalid route ID', async () => {
    const { component } = await setup('abc');
    expect(component.error()).toBeTruthy();
    expect(mockProductService.getProductById).not.toHaveBeenCalled();
  });

  it('should set error for route ID of 0', async () => {
    const { component } = await setup('0');
    expect(component.error()).toBeTruthy();
  });

  it('addToCart() should call lists.addToCart with product and quantity 1', async () => {
    const { component, mockLists } = await setup();
    component.addToCart();
    expect(mockLists.addToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it('addToCart() should not call lists.addToCart when product is null', async () => {
    const { component, mockLists } = await setup('abc');
    component.addToCart();
    expect(mockLists.addToCart).not.toHaveBeenCalled();
  });

  it('toggleWishlist() should call lists.toggleWishlist with product', async () => {
    const { component, mockLists } = await setup();
    component.toggleWishlist();
    expect(mockLists.toggleWishlist).toHaveBeenCalledWith(mockProduct);
  });
});
