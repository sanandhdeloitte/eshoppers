import { createFeature, createReducer, on } from '@ngrx/store';
import { Product } from '../../core/models/product.model';
import { ProductsActions } from './products.actions';

export interface ProductsState {
  products:          Product[];
  categories:        string[];
  loading:           boolean;
  loadingMore:       boolean;
  categoriesLoading: boolean;
  error:             string | null;
  categoriesError:   string | null;
  searchTerm:        string;
  activeCategory:    string;
  sortBy:            'price-asc' | 'price-desc';
  page:              number;
  pageSize:          number;
  total:             number;
}

const initialState: ProductsState = {
  products:          [],
  categories:        [],
  loading:           false,
  loadingMore:       false,
  categoriesLoading: false,
  error:             null,
  categoriesError:   null,
  searchTerm:        '',
  activeCategory:    'All',
  sortBy:            'price-asc',
  page:              1,
  pageSize:          100,
  total:             0,
};

export const productsFeature = createFeature({
  name: 'products',
  reducer: createReducer(
    initialState,

    on(ProductsActions.setSearchTerm, (s, { searchTerm }) => ({
      ...s, searchTerm, page: 1, products: [],
    })),
    on(ProductsActions.setCategory, (s, { category }) => ({
      ...s, activeCategory: category, page: 1, products: [],
    })),
    on(ProductsActions.setSort, (s, { sortBy }) => ({
      ...s, sortBy, page: 1, products: [],
    })),
    on(ProductsActions.setPage, (s, { page }) => ({
      ...s, page,
    })),

    on(ProductsActions.loadProducts, (s) => ({
      ...s, loading: true, error: null,
    })),
    on(ProductsActions.loadProductsSuccess, (s, { products, total, page, pageSize }) => ({
      ...s, products, total, page, pageSize, loading: false,
    })),
    on(ProductsActions.loadProductsFailure, (s, { error }) => ({
      ...s, loading: false, error,
    })),

    on(ProductsActions.loadMoreProducts, (s) => ({
      ...s, loadingMore: true, error: null,
    })),
    on(ProductsActions.appendProductsSuccess, (s, { products, total, page, pageSize }) => ({
      ...s,
      products:    [...s.products, ...products], 
      total,
      page,
      pageSize,
      loadingMore: false,
    })),
    on(ProductsActions.appendProductsFailure, (s, { error }) => ({
      ...s, loadingMore: false, error,
    })),

    on(ProductsActions.loadCategories, (s) => ({
      ...s, categoriesLoading: true, categoriesError: null,
    })),
    on(ProductsActions.loadCategoriesSuccess, (s, { categories }) => ({
      ...s, categories: categories.filter(Boolean), categoriesLoading: false,
    })),
    on(ProductsActions.loadCategoriesFailure, (s, { error }) => ({
      ...s, categoriesLoading: false, categoriesError: error,
    })),
  ),
});
