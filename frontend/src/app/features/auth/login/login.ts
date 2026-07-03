import {
  AfterViewInit, Component, ElementRef,
  Inject, PLATFORM_ID, ViewChild, inject,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';
import { environment } from '../../../../environments/environment';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { InputComponent } from '../../../shared/ui/input/input';
import { ErrorMessageComponent } from '../../../shared/ui/error-message/error-message';
import { AsyncPipe } from '@angular/common';

declare global { interface Window { google?: any; } }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, AsyncPipe, ButtonComponent, InputComponent, ErrorMessageComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  @ViewChild('googleBtn', { static: false }) googleBtn!: ElementRef<HTMLDivElement>;

  private store      = inject(Store);
  private router     = inject(Router);
  private route      = inject(ActivatedRoute); // NEW
  private platformId = inject(PLATFORM_ID);

  form = { email: '', password: '' };

  guestForm        = { name: '', phone: '' };
  showGuestForm    = signal(false);

  error$   = this.store.select(selectAuthError);
  loading$ = this.store.select(selectAuthLoading);

  redirectMessage = '';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  async ngAfterViewInit(): Promise<void> {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'login-required') {
      this.redirectMessage = 'Please sign in to access your cart and wishlist.';
    }

    if (!isPlatformBrowser(this.platformId) || !environment.googleClientId) return;
    try {
      await this.loadGoogleScript();
      this.renderGoogleButton();
    } catch (e) { console.error('GIS load failed', e); }
  }

  signin(form: NgForm): void {
    if (form.invalid) return;
    this.store.dispatch(AuthActions.loginWithEmail({
      email:    this.form.email,
      password: this.form.password,
    }));
  }
  
  toggleGuestForm(): void {
    this.showGuestForm.update(v => !v);
  }

  guestSignin(form: NgForm): void {
    if (form.invalid) return;
    this.store.dispatch(AuthActions.loginAsGuest({
      name:  this.guestForm.name,
      phone: this.guestForm.phone,
    }));
  }


  signup(): void {
    this.router.navigate(['/signup']);
  }

  private handleGoogle(credential: string): void {
    this.store.dispatch(AuthActions.loginWithGoogle({ credential }));
  }

  private loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();
    const existing = this.document.getElementById('google-identity-script') as HTMLScriptElement | null;
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load',  () => resolve(),                          { once: true });
        existing.addEventListener('error', () => reject(new Error('GIS load failed')), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script   = this.document.createElement('script');
      script.id      = 'google-identity-script';
      script.src     = 'https://accounts.google.com/gsi/client';
      script.async   = script.defer = true;
      script.onload  = () => resolve();
      script.onerror = () => reject(new Error('GIS load failed'));
      this.document.head.appendChild(script);
    });
  }

  private renderGoogleButton(): void {
    const target = this.googleBtn?.nativeElement;
    if (!target || !window.google?.accounts?.id) return;
    target.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback:  (res: { credential: string }) => this.handleGoogle(res.credential),
    });
    window.google.accounts.id.renderButton(target, {
      theme: 'outline', size: 'large', text: 'continue_with', width: 320,
    });
  }
}
