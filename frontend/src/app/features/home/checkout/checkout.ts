import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Header } from '../../../shared/header/header';
import { PaymentService } from '../../../services/payment.service';
import { UserListsService } from '../../../services/user-lists.service';
import { AuthService } from '../../../core/auth/services/auth-service';
import { environment } from '../../../../environments/environment';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [Header, CurrencyPipe, RouterLink, Footer],
  templateUrl: './checkout.html',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private router         = inject(Router);
  private paymentService = inject(PaymentService);
  private auth           = inject(AuthService);
  lists                  = inject(UserListsService);

  private stripe: any;
  private cardElement: any;

  isLoading    = signal(false);
  isCardReady  = signal(false);
  intentReady  = signal(false);
  errorMessage = signal('');

  get total(): number {
    return this.lists.cartItems().reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
  }

  async ngOnInit(): Promise<void> {
    this.lists.loadAll();

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
        existing.addEventListener('load',  () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Stripe load failed')), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script  = document.createElement('script');
      script.id     = 'stripe-js';
      script.src    = 'https://js.stripe.com/v3/';
      script.async  = true;
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

    const result = await this.stripe.confirmCardPayment(
      (this as any)._clientSecret,
      {
        payment_method: {
          card:            this.cardElement,
          billing_details: { email: this.auth.user?.email ?? '' },
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
