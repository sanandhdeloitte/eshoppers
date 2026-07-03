import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../core/auth/services/auth-service';
import { environment } from '../../../../environments/environment';
import { Footer } from '../../../shared/footer/footer';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export interface Order {
  _id: string;
  paymentIntentId: string;
  createdAt: string;
  status: string;
  items: OrderItem[];
  amount: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [Header, RouterLink, CurrencyPipe, DatePipe, Footer],
  templateUrl: './orders.html',
})
export class OrdersComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  orders      = signal<Order[]>([]);
  isLoading   = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
      const userId = this.auth.user?.sub?.trim();
  if (!userId) { this.isLoading.set(false); return; }


    this.http.get<{ success: boolean; orders: Order[] }>(
      `${environment.apiUrl}/orders/${userId}`
    ).subscribe({
      next: (res) => {
        this.orders.set(res.orders ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      paid:       'bg-green-100 text-green-700',
      pending:    'bg-yellow-100 text-yellow-700',
      failed:     'bg-red-100 text-red-700',
      processing: 'bg-blue-100 text-blue-700',
    };
    return map[status.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  }
}
