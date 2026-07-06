import { createSelector } from '@ngrx/store';
import { productsFeature } from './products.reducer';

export const {
  selectProducts,
  selectCategories: selectCategoriesState,
  selectLoading:           selectProductsLoading,
  selectLoadingMore,                             
  selectCategoriesLoading,
  selectError:             selectProductsError,
  selectCategoriesError,
  selectSearchTerm,
  selectActiveCategory,
  selectSortBy,
  selectPage,
  selectPageSize,
  selectTotal,
} = productsFeature;

export const selectCategories = createSelector(
  selectCategoriesState,
  (cats) => ['All', ...cats.filter((c) => c !== 'All')]
);

export const selectTotalPages = createSelector(
  selectTotal, selectPageSize,
  (total, pageSize) => Math.max(1, Math.ceil(total / pageSize))
);

export const selectHasMore = createSelector(
  selectProducts, selectTotal,
  (products, total) => products.length < total
);
