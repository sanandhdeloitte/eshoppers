import {
  ChangeDetectionStrategy, Component, OnDestroy, OnInit,
  PLATFORM_ID, inject, signal, HostListener,
} from '@angular/core';
import { isPlatformBrowser, TitleCasePipe, AsyncPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Header } from '../../../shared/header/header';
import { ErrorMessageComponent } from '../../../shared/ui/error-message/error-message';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card';
import { UserListsService } from '../../../services/user-lists.service';
import { selectUser } from '../../../store/auth/auth.selectors';
import { ProductsActions } from '../../../store/products/products.actions';
import {
  selectActiveCategory, selectCategories, selectHasMore,
  selectLoadingMore, selectProducts, selectProductsError,
  selectProductsLoading, selectSortBy, selectTotal,
} from '../../../store/products/products.selectors';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe, AsyncPipe, NgClass, RouterLink,
    Header, ErrorMessageComponent, ProductCardComponent, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private readonly store      = inject(Store);
  private readonly lists      = inject(UserListsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$   = new Subject<void>();
  private observer: IntersectionObserver | null = null;

  user$           = this.store.select(selectUser);
  products$       = this.store.select(selectProducts);
  loading$        = this.store.select(selectProductsLoading);
  loadingMore$    = this.store.select(selectLoadingMore);
  error$          = this.store.select(selectProductsError);
  categories$     = this.store.select(selectCategories);
  activeCategory$ = this.store.select(selectActiveCategory);
  sortBy$         = this.store.select(selectSortBy);
  total$          = this.store.select(selectTotal);

  hasMore = this.store.selectSignal(selectHasMore);

  skeletonItems  = Array.from({ length: 8 }, (_, i) => i);
  showBanner     = signal(true);
  bannerFading   = signal(false);
  isCategoryOpen = signal(false);
  isSortOpen     = signal(false);

  readonly sortOptions = [
    { value: 'price-asc',  label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
  ] as const;

  ngOnInit(): void {
    this.store.dispatch(ProductsActions.loadCategories());
    this.store.dispatch(ProductsActions.loadProducts());

    if (isPlatformBrowser(this.platformId)) {
      this.deferListsLoad();
      this.scheduleBannerDismiss();

      this.products$.pipe(takeUntil(this.destroy$)).subscribe((products) => {
        if (products.length > 0) this.attachObserver();
      });
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleCategory(): void {
    this.isCategoryOpen.update(v => !v);
    this.isSortOpen.set(false);
  }

  toggleSort(): void {
    this.isSortOpen.update(v => !v);
    this.isCategoryOpen.set(false);
  }

  selectCategory(category: string): void {
    this.isCategoryOpen.set(false);
    this.setCategory(category);
  }

  selectSort(sortBy: 'price-asc' | 'price-desc'): void {
    this.isSortOpen.set(false);
    this.setSort(sortBy);
  }

  getSortLabel(value: string): string {
    return this.sortOptions.find(o => o.value === value)?.label ?? value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('[data-dropdown]')) {
      this.isCategoryOpen.set(false);
      this.isSortOpen.set(false);
    }
  }

  setCategory(category: string): void {
    this.observer?.disconnect();
    this.observer = null;
    this.store.dispatch(ProductsActions.setCategory({ category }));
  }

  setSort(sortBy: 'price-asc' | 'price-desc'): void {
    this.observer?.disconnect();
    this.observer = null;
    this.store.dispatch(ProductsActions.setSort({ sortBy }));
  }

  dismissBanner(): void {
    this.bannerFading.set(true);
    if (isPlatformBrowser(this.platformId)) {
      window.setTimeout(() => this.showBanner.set(false), 500);
    }
  }

  showBannerAgain(): void {
    this.bannerFading.set(false);
    this.showBanner.set(true);
  }

  private scheduleBannerDismiss(): void {
    window.setTimeout(() => this.bannerFading.set(true), 4000);
    window.setTimeout(() => this.showBanner.set(false), 4500);
  }

  private deferListsLoad(): void {
    const run = () => this.lists.loadAll();
    const win = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
    };
    if (win.requestIdleCallback) {
      win.requestIdleCallback(() => run(), { timeout: 1500 });
      return;
    }
    window.setTimeout(run, 800);
  }

  private attachObserver(): void {
    if (this.observer) return;
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        if (!this.hasMore()) {
          this.observer?.disconnect();
          this.observer = null;
          return;
        }

        this.store.dispatch(ProductsActions.loadMoreProducts());
      },
      { root: null, rootMargin: '300px', threshold: 0 },
    );

    this.observer.observe(sentinel);
  }
}
