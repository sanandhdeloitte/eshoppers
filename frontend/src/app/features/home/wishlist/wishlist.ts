import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth-service';
import { Product } from '../../../core/models/product.model';
import { UserListsService } from '../../../services/user-lists.service';
import { Footer } from '../../../shared/footer/footer';

interface WishlistResponse {
  success: boolean;
  productIds: number[];
  products: Product[];
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [Header, RouterLink, CurrencyPipe, Footer],
  templateUrl: './wishlist.html',
})
export class WishlistComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  lists = inject(UserListsService);

  products = signal<Product[]>([]);

  ngOnInit(): void {
    this.lists.loadAll();
    this.loadWishlistProducts();
  }

  loadWishlistProducts(): void {
    const userId = this.auth.user?.sub?.trim();
  if (!userId) return;
    console.log(environment.apiUrl + "wishlist" + userId)

    this.http
      .get<WishlistResponse>(`${environment.apiUrl}/wishlist/${userId}`)
      .subscribe({
        next: (res) => this.products.set(res.products ?? []),
        error: () => this.products.set([]),
      });
  }

  remove(product: Product): void {
    this.lists.toggleWishlist(product);
    this.products.set(this.products().filter((item) => item.id !== product.id));
  }

  moveToCart(product: Product): void {
    this.lists.addToCart(product, 1);
  }
}
