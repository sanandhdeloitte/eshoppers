import { productsFeature, ProductsState } from './products.reducer';
import { ProductsActions }                from './products.actions';
import { Product }                        from '../../core/models/product.model';

const reducer = productsFeature.reducer;

const mockProduct: Product = {
  id: 1, name: 'Test', title: 'Test Product', description: '',
  price: 10, category: 'Electronics', thumbnail: '', stock: 5,
};

const initial: ProductsState = {
  products: [], categories: [], loading: false,
  loadingMore: false, categoriesLoading: false,
  error: null, categoriesError: null, searchTerm: '',
  activeCategory: 'All', sortBy: 'price-asc',
  page: 1, pageSize: 100, total: 0,
};

describe('Products Reducer', () => {

  it('should return initial state for unknown action', () => {
    expect(reducer(undefined, { type: '@@UNKNOWN' } as any)).toEqual(initial);
  });

  // Filters
  it('setSearchTerm should update searchTerm and reset page + products', () => {
    const withProducts = { ...initial, products: [mockProduct], page: 3 };
    const state = reducer(withProducts, ProductsActions.setSearchTerm({ searchTerm: 'headphones' }));
    expect(state.searchTerm).toBe('headphones');
    expect(state.page).toBe(1);
    expect(state.products).toEqual([]);
  });

  it('setCategory should update activeCategory and reset page + products', () => {
    const state = reducer(
      { ...initial, products: [mockProduct], page: 2 },
      ProductsActions.setCategory({ category: 'Fashion' })
    );
    expect(state.activeCategory).toBe('Fashion');
    expect(state.page).toBe(1);
    expect(state.products).toEqual([]);
  });

  it('setSort should update sortBy and reset page + products', () => {
    const state = reducer(initial, ProductsActions.setSort({ sortBy: 'price-desc' }));
    expect(state.sortBy).toBe('price-desc');
    expect(state.page).toBe(1);
    expect(state.products).toEqual([]);
  });

  it('setPage should update page only', () => {
    const state = reducer(initial, ProductsActions.setPage({ page: 5 }));
    expect(state.page).toBe(5);
    expect(state.products).toEqual([]);
  });

  // Load products
  it('loadProducts should set loading=true', () => {
    const state = reducer(initial, ProductsActions.loadProducts());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadProductsSuccess should replace products and set loading=false', () => {
    const state = reducer(
      { ...initial, loading: true },
      ProductsActions.loadProductsSuccess({ products: [mockProduct], total: 1, page: 1, pageSize: 10 })
    );
    expect(state.products).toEqual([mockProduct]);
    expect(state.total).toBe(1);
    expect(state.loading).toBe(false);
  });

  it('loadProductsFailure should set error and loading=false', () => {
    const state = reducer(
      { ...initial, loading: true },
      ProductsActions.loadProductsFailure({ error: 'Failed' })
    );
    expect(state.error).toBe('Failed');
    expect(state.loading).toBe(false);
  });

  // Infinite scroll
  it('loadMoreProducts should set loadingMore=true', () => {
    const state = reducer(initial, ProductsActions.loadMoreProducts());
    expect(state.loadingMore).toBe(true);
  });

  it('appendProductsSuccess should APPEND products (not replace)', () => {
    const existing = { ...initial, products: [mockProduct] };
    const newProduct = { ...mockProduct, id: 2 };
    const state = reducer(
      existing,
      ProductsActions.appendProductsSuccess({ products: [newProduct], total: 2, page: 2, pageSize: 1 })
    );
    expect(state.products).toHaveLength(2);
    expect(state.products[0].id).toBe(1);
    expect(state.products[1].id).toBe(2);
    expect(state.loadingMore).toBe(false);
  });

  it('appendProductsFailure should set error and loadingMore=false', () => {
    const state = reducer(
      { ...initial, loadingMore: true },
      ProductsActions.appendProductsFailure({ error: 'No more' })
    );
    expect(state.error).toBe('No more');
    expect(state.loadingMore).toBe(false);
  });

  // Categories
  it('loadCategories should set categoriesLoading=true', () => {
    const state = reducer(initial, ProductsActions.loadCategories());
    expect(state.categoriesLoading).toBe(true);
  });

  it('loadCategoriesSuccess should set categories and loading=false', () => {
    const state = reducer(
      { ...initial, categoriesLoading: true },
      ProductsActions.loadCategoriesSuccess({ categories: ['Electronics', 'Fashion'] })
    );
    expect(state.categories).toEqual(['Electronics', 'Fashion']);
    expect(state.categoriesLoading).toBe(false);
  });

  it('loadCategoriesFailure should set categoriesError', () => {
    const state = reducer(initial, ProductsActions.loadCategoriesFailure({ error: 'Cat error' }));
    expect(state.categoriesError).toBe('Cat error');
    expect(state.categoriesLoading).toBe(false);
  });
});
