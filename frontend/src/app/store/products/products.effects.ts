import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, exhaustMap, filter, map, of, switchMap } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { ProductsActions } from './products.actions';
import {
  selectActiveCategory, selectPage, selectPageSize,
  selectSearchTerm, selectSortBy, selectHasMore,
} from './products.selectors';

@Injectable()
export class ProductsEffects {
  private actions$       = inject(Actions);
  private store          = inject(Store);
  private productService = inject(ProductService);

  searchChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.setSearchTerm),
      debounceTime(300),
      map(() => ProductsActions.loadProducts())
    )
  );

  queryChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.setCategory, ProductsActions.setSort, ProductsActions.setPage),
      map(() => ProductsActions.loadProducts())
    )
  );

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      concatLatestFrom(() => [
        this.store.select(selectSearchTerm),
        this.store.select(selectActiveCategory),
        this.store.select(selectSortBy),
        this.store.select(selectPageSize),
      ]),
      switchMap(([, searchTerm, activeCategory, sortBy, pageSize]) =>
        this.productService.getProducts({
          search:   searchTerm,
          category: activeCategory === 'All' ? undefined : activeCategory,
          sort:     sortBy,
          page:     1,
          pageSize,
        }).pipe(
          map((res) => ProductsActions.loadProductsSuccess({
            products: res.products ?? [],
            total:    res.total    ?? 0,
            page:     1,
            pageSize: res.pageSize ?? pageSize,
          })),
          catchError(() => of(ProductsActions.loadProductsFailure({
            error: 'Failed to load products',
          })))
        )
      )
    )
  );

  loadMoreProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadMoreProducts),
      concatLatestFrom(() => [
        this.store.select(selectSearchTerm),
        this.store.select(selectActiveCategory),
        this.store.select(selectSortBy),
        this.store.select(selectPage),        
        this.store.select(selectPageSize),
        this.store.select(selectHasMore),     
      ]),
      filter(([, , , , , , hasMore]) => !!hasMore),
      exhaustMap(([, searchTerm, activeCategory, sortBy, page, pageSize]) => {
        const nextPage = (page as number) + 1;
        return this.productService.getProducts({
          search:   searchTerm as string,
          category: (activeCategory as string) === 'All' ? undefined : (activeCategory as string),
          sort:     sortBy as 'price-asc' | 'price-desc',
          page:     nextPage,
          pageSize: pageSize as number,
        }).pipe(
          map((res) => ProductsActions.appendProductsSuccess({
            products: res.products ?? [],
            total:    res.total    ?? 0,
            page:     res.page     ?? nextPage,
            pageSize: res.pageSize ?? (pageSize as number),
          })),
          catchError(() => of(ProductsActions.appendProductsFailure({
            error: 'Failed to load more products',
          })))
        );
      })
    )
  );

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadCategories),
      switchMap(() =>
        this.productService.getCategories().pipe(
          map((res) => ProductsActions.loadCategoriesSuccess({
            categories: res.categories ?? [],
          })),
          catchError(() => of(ProductsActions.loadCategoriesFailure({
            error: 'Failed to load categories',
          })))
        )
      )
    )
  );
}
