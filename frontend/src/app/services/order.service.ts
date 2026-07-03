import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Order {
  _id:             string;
  paymentIntentId: string;
  amount:          number;
  currency:        string;
  email:           string;
  items:           { name: string; price: number; quantity: number; thumbnail?: string }[];
  status:          string;
  createdAt:       string;
}

interface OrdersResponse {
  success: boolean;
  orders:  Order[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(this.apiUrl);
  }
}
