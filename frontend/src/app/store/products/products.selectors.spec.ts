import {
  selectProducts, selectProductsLoading, selectProductsError,
  selectCategories, selectActiveCategory, selectSortBy,
  selectSearchTerm, selectTotal, selectHasMore,
  selectTotalPages, selectLoadingMore,
} from './products.selectors';
import { Product } from '../../core/models/product.model';

const mockProduct: Product = {
  id: 1, name: 'Test', description: '', price: 10,
  category: 'Electronics', thumbnail: '', stock: 5,
};

const makeState = (overrides = {}) => ({
  products: {
    products: [], categories: [], loading: false,
    loadingMore: false, categoriesLoading: false,
    error: null, categoriesError: null, searchTerm: '',
    activeCategory: 'All', sortBy: 'price-asc' as const,
    page: 1, pageSize: 10, total: 0,
    ...overrides,
  },
});

describe('Products Selectors', () => {

  afterEach(() => {
    selectProducts.release();
    selectProductsLoading.release();
    selectProductsError.release();
    selectCategories.release();
    selectActiveCategory.release();
    selectSortBy.release();
    selectSearchTerm.release();
    selectTotal.release();
    selectLoadingMore.release();
    selectHasMore.release();
    selectTotalPages.release();
  });

  it('selectProducts returns product list', () => {
    expect(selectProducts(makeState({ products: [mockProduct] }))).toEqual([mockProduct]);
  });

  it('selectProductsLoading returns loading flag', () => {
    expect(selectProductsLoading(makeState({ loading: true }))).toBe(true);
  });

  it('selectProductsError returns error', () => {
    expect(selectProductsError(makeState({ error: 'oops' }))).toBe('oops');
  });

  it('selectCategories always prepends All', () => {
    const cats = selectCategories(makeState({ categories: ['Electronics'] }));
    expect(cats[0]).toBe('All');
    expect(cats).toContain('Electronics');
  });

  it('selectCategories removes duplicate All', () => {
    const cats = selectCategories(makeState({ categories: ['All', 'Fashion'] }));
    expect(cats.filter(c => c === 'All')).toHaveLength(1);
  });

  it('selectActiveCategory returns current category', () => {
    expect(selectActiveCategory(makeState({ activeCategory: 'Fashion' }))).toBe('Fashion');
  });

  it('selectSortBy returns sort option', () => {
    expect(selectSortBy(makeState({ sortBy: 'price-desc' }))).toBe('price-desc');
  });

  it('selectSearchTerm returns search term', () => {
    expect(selectSearchTerm(makeState({ searchTerm: 'laptop' }))).toBe('laptop');
  });

  it('selectTotal returns total count', () => {
    expect(selectTotal(makeState({ total: 42 }))).toBe(42);
  });

  it('selectLoadingMore returns loadingMore flag', () => {
    expect(selectLoadingMore(makeState({ loadingMore: true }))).toBe(true);
  });

  it('selectHasMore is true when products.length < total', () => {
    expect(selectHasMore(makeState({ products: [mockProduct], total: 5 }))).toBe(true);
  });

  it('selectHasMore is false when products.length >= total', () => {
    expect(selectHasMore(makeState({ products: [mockProduct], total: 1 }))).toBe(false);
  });

  it('selectTotalPages calculates correctly', () => {
    expect(selectTotalPages(makeState({ total: 25, pageSize: 10 }))).toBe(3);
  });

  it('selectTotalPages returns 1 when total is 0', () => {
    expect(selectTotalPages(makeState({ total: 0, pageSize: 10 }))).toBe(1);
  });
});
