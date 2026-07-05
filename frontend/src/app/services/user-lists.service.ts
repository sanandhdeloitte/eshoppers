import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/services/auth-service';
import { Product } from '../core/models/product.model';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  productId:  number;
  quantity:   number;
  name:       string;
  price:      number;
  thumbnail:  string;
  brand?:     string;
  stock:      number | string;
}

interface CartResponse     { success: boolean; items: CartItem[]; }
interface WishlistResponse { success: boolean; productIds: number[]; products: Product[]; }

@Injectable({ providedIn: 'root' })
export class UserListsService {
  private http   = inject(HttpClient);
  private auth   = inject(AuthService);
  private toastr = inject(ToastrService);
  private apiUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);

  cartItems    = signal<CartItem[]>([]);
  wishlistIds  = signal<number[]>([]);
  cartCount    = computed(() => this.cartItems().reduce((sum, i) => sum + i.quantity, 0));
  wishlistCount = computed(() => this.wishlistIds().length);

  // ← KEY CHANGE: use sub (universal ID) instead of email
  private get userId(): string {
    const id = this.auth.user?.sub?.trim();
    if (!id) throw new Error('User not logged in');
    return id;
  }

  loadAll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      forkJoin({
        cart:     this.http.get<CartResponse>(`${this.apiUrl}/cart/${this.userId}`),
        wishlist: this.http.get<WishlistResponse>(`${this.apiUrl}/wishlist/${this.userId}`),
      }).subscribe({
        next: ({ cart, wishlist }) => {
          this.cartItems.set(cart.items ?? []);
          this.wishlistIds.set(wishlist.productIds ?? []);
        },
        error: () => { this.cartItems.set([]); this.wishlistIds.set([]); },
      });
    } catch {
      this.cartItems.set([]); this.wishlistIds.set([]);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistIds().includes(productId);
  }

  getCartQuantity(productId: number): number {
    return this.cartItems().find((i) => i.productId === productId)?.quantity ?? 0;
  }

  addToCart(product: Product, quantity = 1): void {
    this.http.post<CartResponse>(`${this.apiUrl}/cart/${this.userId}`, { productId: product.id, quantity })
      .subscribe({
        next:  (res) => { this.cartItems.set(res.items ?? []); this.toastr.success(`${product.title ?? product.name} added to cart`); },
        error: ()    => this.toastr.error('Failed to add to cart'),
      });
  }

  updateCart(productId: number, quantity: number): void {
    this.http.patch<CartResponse>(`${this.apiUrl}/cart/${this.userId}/${productId}`, { quantity })
      .subscribe({
        next:  (res) => { this.cartItems.set(res.items ?? []); this.toastr.info('Cart updated'); },
        error: ()    => this.toastr.error('Failed to update cart'),
      });
  }

  removeFromCart(productId: number): void {
    this.http.delete<CartResponse>(`${this.apiUrl}/cart/${this.userId}/${productId}`)
      .subscribe({
        next:  (res) => { this.cartItems.set(res.items ?? []); this.toastr.warning('Item removed from cart'); },
        error: ()    => this.toastr.error('Failed to remove item'),
      });
  }

  toggleWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.http.delete<WishlistResponse>(`${this.apiUrl}/wishlist/${this.userId}/${product.id}`)
        .subscribe({
          next:  (res) => { this.wishlistIds.set(res.productIds ?? []); this.toastr.warning(`${product.title ?? product.name} removed from wishlist`); },
          error: ()    => this.toastr.error('Failed to update wishlist'),
        });
      return;
    }
    this.http.post<WishlistResponse>(`${this.apiUrl}/wishlist/${this.userId}`, { productId: product.id })
      .subscribe({
        next:  (res) => { this.wishlistIds.set(res.productIds ?? []); this.toastr.success(`${product.title ?? product.name} added to wishlist`); },
        error: ()    => this.toastr.error('Failed to update wishlist'),
      });
  }

  clearCart(): void {
    this.cartItems.set([]);
    try {
      this.http.delete(`${this.apiUrl}/cart/${this.userId}`)
        .subscribe({ error: (e) => console.error('Cart clear failed', e) });
    } catch {}
  }

  clear(): void { this.cartItems.set([]); this.wishlistIds.set([]); }
}
