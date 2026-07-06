import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule }   from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal }                from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ToastrModule }          from 'ngx-toastr';
import { of }                    from 'rxjs';
import { vi }                    from 'vitest';
import { Home }                  from './home';
import { UserListsService }      from '../../../services/user-lists.service';
import { ProductsActions }       from '../../../store/products/products.actions';
import {
  selectProducts, selectProductsLoading, selectLoadingMore,
  selectHasMore, selectProductsError, selectCategories,
  selectActiveCategory, selectSortBy, selectTotal,
} from '../../../store/products/products.selectors';
import { selectUser } from '../../../store/auth/auth.selectors';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockProduct = {
  id: 1, title: 'Phone', price: 299, category: 'Electronics',
  description: '', image: '', rating: 4, stock: 5,
};

const mockLists = {
  cartCount:     signal(0),
  wishlistCount: signal(0),
  loadAll:       vi.fn(),
  clear:         vi.fn(),
};

const initialState = {
  auth:     { user: null, token: null, loading: false,
              error: null, sessionRestored: true },
  products: { items: [], total: 0, page: 1, pageSize: 12,
              loading: false, loadingMore: false, error: null,
              hasMore: false, searchTerm: '', activeCategory: 'All',
              sortBy: 'price-asc', categories: [] },
};

// ─────────────────────────────────────────────────────────────────────────
describe('Home', () => {
  let fixture:   ComponentFixture<Home>;
  let component: Home;
  let store:     MockStore;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.resetAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        Home, RouterTestingModule,
        HttpClientTestingModule, ToastrModule.forRoot(),
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: UserListsService, useValue: mockLists },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    // Override all selectors to avoid real store subscription issues
    store.overrideSelector(selectUser,             null);
    store.overrideSelector(selectProducts,         []);
    store.overrideSelector(selectProductsLoading,  false);
    store.overrideSelector(selectLoadingMore,       false);
    store.overrideSelector(selectHasMore,           false);
    store.overrideSelector(selectProductsError,    null);
    store.overrideSelector(selectCategories,       []);
    store.overrideSelector(selectActiveCategory,   'All');
    store.overrideSelector(selectSortBy,           'price-asc');
    store.overrideSelector(selectTotal,             0);
    store.refreshState();

    fixture   = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  afterEach(() => TestBed.resetTestingModule());

  // ── 1. creates ───────────────────────────────────────────────────────
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── 2. dispatches on init ─────────────────────────────────────────────
  it('should dispatch loadCategories and loadProducts on init', () => {
    const spy = vi.spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(ProductsActions.loadCategories());
    expect(spy).toHaveBeenCalledWith(ProductsActions.loadProducts());
  });

  // ── 3. banner ─────────────────────────────────────────────────────────
  it('should initialise with showBanner = true', () => {
    fixture.detectChanges();
    expect(component.showBanner()).toBe(true);
  });

  it('dismissBanner() should set bannerFading to true', () => {
    fixture.detectChanges();
    component.dismissBanner();
    expect(component.bannerFading()).toBe(true);
  });

  it('showBannerAgain() should reset fading and show banner', () => {
    fixture.detectChanges();
    component.dismissBanner();
    component.showBannerAgain();
    expect(component.bannerFading()).toBe(false);
    expect(component.showBanner()).toBe(true);
  });

  // ── 4. setCategory ────────────────────────────────────────────────────
  it('setCategory() should dispatch setCategory action', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(store, 'dispatch');
    component.setCategory('Fashion');
    expect(spy).toHaveBeenCalledWith(
      ProductsActions.setCategory({ category: 'Fashion' })
    );
  });

  // ── 5. setSort ────────────────────────────────────────────────────────
  it('setSort() should dispatch setSort action', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(store, 'dispatch');
    component.setSort('price-desc');
    expect(spy).toHaveBeenCalledWith(
      ProductsActions.setSort({ sortBy: 'price-desc' })
    );
  });

  // ── 6. skeleton ───────────────────────────────────────────────────────
  it('skeletonItems should contain 8 entries', () => {
    fixture.detectChanges();
    expect(component.skeletonItems.length).toBe(8);
  });

  // ── 7. ngOnDestroy ────────────────────────────────────────────────────
  it('ngOnDestroy() should not throw', () => {
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
