import { TestBed }              from '@angular/core/testing';
import { provideMockActions }   from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';
import { vi }                   from 'vitest';
import { ProductsEffects }      from './products.effects';
import { ProductsActions }      from './products.actions';
import { ProductService }       from '../../services/product.service';
import {
  selectSearchTerm, selectActiveCategory, selectSortBy,
  selectPage, selectPageSize, selectHasMore,
} from './products.selectors';

const mockProducts   = [
  { id: 1, title: 'Phone', name: 'Phone', price: 299, category: 'Electronics',
    description: '', image: '', thumbnail: '', rating: 4, stock: 10 },
];
const mockCategories = ['Electronics', 'Fashion'];

const mockProductService = {
  getProducts:   vi.fn(),
  getCategories: vi.fn(),
};

const initialState = {
  products: {
    items: [], total: 0, page: 1, pageSize: 12,
    loading: false, loadingMore: false, error: null,
    hasMore: true, searchTerm: '', activeCategory: 'All',
    sortBy: 'price-asc', categories: [],
  },
};

describe('ProductsEffects', () => {
  let effects:  ProductsEffects;
  let actions$: Observable<any>;
  let store:    MockStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.resetAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ProductsEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        { provide: ProductService, useValue: mockProductService },
      ],
    });

    effects = TestBed.inject(ProductsEffects);
    store   = TestBed.inject(MockStore);

    store.overrideSelector(selectSearchTerm,     '');
    store.overrideSelector(selectActiveCategory, 'All');
    store.overrideSelector(selectSortBy,         'price-asc');
    store.overrideSelector(selectPage,           1);
    store.overrideSelector(selectPageSize,       12);
    store.overrideSelector(selectHasMore,        true);
    store.refreshState();
  });

  afterEach(() => TestBed.resetTestingModule());

  // ── searchChange$ ──────────────────────────────────────────────────────
  it('searchChange$ should emit loadProducts after setSearchTerm', async () => {
    actions$ = of(ProductsActions.setSearchTerm({ searchTerm: 'phone' }));

    const action = await firstValueFrom(effects.searchChange$);

    expect(action).toEqual(ProductsActions.loadProducts());
  });

  // ── queryChange$ ───────────────────────────────────────────────────────
  it('queryChange$ should emit loadProducts on setCategory', async () => {
    actions$ = of(ProductsActions.setCategory({ category: 'Fashion' }));

    const action = await firstValueFrom(effects.queryChange$);

    expect(action).toEqual(ProductsActions.loadProducts());
  });

  it('queryChange$ should emit loadProducts on setSort', async () => {
    actions$ = of(ProductsActions.setSort({ sortBy: 'price-desc' }));

    const action = await firstValueFrom(effects.queryChange$);

    expect(action).toEqual(ProductsActions.loadProducts());
  });

  // ── loadProducts$ ──────────────────────────────────────────────────────
  describe('loadProducts$', () => {
    it('should dispatch loadProductsSuccess on successful fetch', async () => {
      mockProductService.getProducts.mockReturnValue(
        of({ products: mockProducts, total: 1, pageSize: 12 })
      );
      actions$ = of(ProductsActions.loadProducts());

      const action = await firstValueFrom(effects.loadProducts$);

      expect(action).toEqual(
        ProductsActions.loadProductsSuccess({
          products: mockProducts, total: 1, page: 1, pageSize: 12,
        })
      );
    });

    it('should dispatch loadProductsFailure on service error', async () => {
      mockProductService.getProducts.mockReturnValue(
        throwError(() => new Error('API down'))
      );
      actions$ = of(ProductsActions.loadProducts());

      const action = await firstValueFrom(effects.loadProducts$);

      expect(action).toEqual(
        ProductsActions.loadProductsFailure({ error: 'Failed to load products' })
      );
    });

    it('should pass undefined category when activeCategory is "All"', async () => {
      store.overrideSelector(selectActiveCategory, 'All');
      store.refreshState();
      mockProductService.getProducts.mockReturnValue(
        of({ products: [], total: 0, pageSize: 12 })
      );
      actions$ = of(ProductsActions.loadProducts());

      await firstValueFrom(effects.loadProducts$);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ category: undefined })
      );
    });

    it('should pass category when activeCategory is not "All"', async () => {
      store.overrideSelector(selectActiveCategory, 'Electronics');
      store.refreshState();
      mockProductService.getProducts.mockReturnValue(
        of({ products: [], total: 0, pageSize: 12 })
      );
      actions$ = of(ProductsActions.loadProducts());

      await firstValueFrom(effects.loadProducts$);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Electronics' })
      );
    });
  });

  // ── loadMoreProducts$ ──────────────────────────────────────────────────
  describe('loadMoreProducts$', () => {
    it('should dispatch appendProductsSuccess on successful fetch', async () => {
      store.overrideSelector(selectPage,    1);
      store.overrideSelector(selectHasMore, true);
      store.refreshState();

      mockProductService.getProducts.mockReturnValue(
        of({ products: mockProducts, total: 10, page: 2, pageSize: 12 })
      );
      actions$ = of(ProductsActions.loadMoreProducts());

      const action = await firstValueFrom(effects.loadMoreProducts$);

      expect(action).toEqual(
        ProductsActions.appendProductsSuccess({
          products: mockProducts, total: 10, page: 2, pageSize: 12,
        })
      );
    });

    it('should skip fetch when hasMore is false', async () => {
  store.overrideSelector(selectHasMore, false);
  store.refreshState();
  actions$ = of(ProductsActions.loadMoreProducts());

  // ✅ firstValueFrom with defaultValue — avoids EmptyError when observable
  // completes without emitting (effect filters the action out via filter(hasMore))
  const result = await firstValueFrom(
    effects.loadMoreProducts$,
    { defaultValue: null }
  );

  expect(result).toBeNull();
  expect(mockProductService.getProducts).not.toHaveBeenCalled();
});

    it('should dispatch appendProductsFailure on error', async () => {
      store.overrideSelector(selectHasMore, true);
      store.refreshState();

      mockProductService.getProducts.mockReturnValue(
        throwError(() => new Error('fail'))
      );
      actions$ = of(ProductsActions.loadMoreProducts());

      const action = await firstValueFrom(effects.loadMoreProducts$);

      expect(action).toEqual(
        ProductsActions.appendProductsFailure({ error: 'Failed to load more products' })
      );
    });
  });

  // ── loadCategories$ ────────────────────────────────────────────────────
  describe('loadCategories$', () => {
    it('should dispatch loadCategoriesSuccess on success', async () => {
      mockProductService.getCategories.mockReturnValue(
        of({ categories: mockCategories })
      );
      actions$ = of(ProductsActions.loadCategories());

      const action = await firstValueFrom(effects.loadCategories$);

      expect(action).toEqual(
        ProductsActions.loadCategoriesSuccess({ categories: mockCategories })
      );
    });

    it('should dispatch loadCategoriesFailure on error', async () => {
      mockProductService.getCategories.mockReturnValue(
        throwError(() => new Error('fail'))
      );
      actions$ = of(ProductsActions.loadCategories());

      const action = await firstValueFrom(effects.loadCategories$);

      expect(action).toEqual(
        ProductsActions.loadCategoriesFailure({ error: 'Failed to load categories' })
      );
    });
  });
});
