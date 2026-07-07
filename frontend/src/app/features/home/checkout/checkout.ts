import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../shared/header/header';
import { PaymentService } from '../../../services/payment.service';
import { UserListsService } from '../../../services/user-lists.service';
import { AuthService } from '../../../core/auth/services/auth-service';
import { environment } from '../../../../environments/environment';
import { Footer } from '../../../shared/footer/footer';

export interface ShippingAddress {
  fullName: string;
  line1:    string;
  line2:    string;
  city:     string;
  state:    string;
  zip:      string;
  country:  string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [Header, CurrencyPipe, RouterLink, Footer, FormsModule],
  templateUrl: './checkout.html',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private router         = inject(Router);
  private paymentService = inject(PaymentService);
  private auth           = inject(AuthService);
  lists                  = inject(UserListsService);

  private stripe: any;
  private cardElement: any;

  step = signal<1 | 2>(1);

  address = signal<ShippingAddress>({
    fullName: '', line1: '', line2: '',
    city: '', state: '', zip: '', country: 'US',
  });

  isAddressValid = computed(() => {
    const a = this.address();
    return !!(a.fullName.trim() && a.line1.trim() &&
              a.city.trim()     && a.state.trim() && a.zip.trim());
  });

  isLoading    = signal(false);
  isCardReady  = signal(false);
  intentReady  = signal(false);
  errorMessage = signal('');

  get total(): number {
    return this.lists.cartItems().reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
  }

  ngOnInit(): void {
    this.lists.loadAll();
    this.loadStripeScript();  
  }

  patchAddress(field: keyof ShippingAddress, value: string): void {
    this.address.update(a => ({ ...a, [field]: value }));
  }

  async continueToPayment(): Promise<void> {
    if (!this.isAddressValid()) return;

    this.step.set(2);
    this.errorMessage.set('');

    await this.loadStripeScript();
    this.stripe = (window as any)['Stripe'](environment.stripePublishableKey);

    this.paymentService.createIntent(this.total, this.lists.cartItems())
      .subscribe({
        next:  (res) => { this.intentReady.set(true); this.mountCard(res.clientSecret); },
        error: ()    => this.errorMessage.set('Could not initialize payment. Please try again.'),
      });
  }

  private loadStripeScript(): Promise<void> {
    if ((window as any)['Stripe']) return Promise.resolve();
    const existing = document.getElementById('stripe-js') as HTMLScriptElement | null;
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load',  () => resolve(),                              { once: true });
        existing.addEventListener('error', () => reject(new Error('Stripe load failed')), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script   = document.createElement('script');
      script.id      = 'stripe-js';
      script.src     = 'https://js.stripe.com/v3/';
      script.async   = true;
      script.onload  = () => resolve();
      script.onerror = () => reject(new Error('Stripe load failed'));
      document.head.appendChild(script);
    });
  }

  private mountCard(clientSecret: string): void {
    const elements   = this.stripe.elements({ clientSecret });
    this.cardElement = elements.create('card', {
      style: {
        base:    { fontSize: '16px', color: '#32325d', '::placeholder': { color: '#aab7c4' } },
        invalid: { color: '#fa755a' },
      },
    });
    this.cardElement.mount('#card-element');
    this.cardElement.on('ready',  ()       => this.isCardReady.set(true));
    this.cardElement.on('change', (e: any) => this.errorMessage.set(e.error?.message ?? ''));
    (this as any)._clientSecret = clientSecret;
  }

  async handlePayment(): Promise<void> {
    if (!this.isCardReady() || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    const a      = this.address();
    const result = await this.stripe.confirmCardPayment(
      (this as any)._clientSecret,
      {
        payment_method: {
          card:            this.cardElement,
          billing_details: {
            name:    a.fullName,
            email:   this.auth.user?.email ?? '',
            address: { line1: a.line1, line2: a.line2, city: a.city, state: a.state, postal_code: a.zip, country: a.country },
          },
        },
      }
    );

    if (result.error) {
      this.errorMessage.set(result.error.message);
      this.isLoading.set(false);
    } else if (result.paymentIntent?.status === 'succeeded') {
      this.lists.clearCart();
      this.router.navigate(['/payment-status'], { queryParams: { status: 'success' } });
    }
  }

  ngOnDestroy(): void { this.cardElement?.destroy(); }
}
