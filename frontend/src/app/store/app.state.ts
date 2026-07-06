import { AuthState } from './auth/auth.reducer';
import { ProductsState } from './products/products.reducer';

export interface AppState {
  auth: AuthState;
  products: ProductsState;
}
