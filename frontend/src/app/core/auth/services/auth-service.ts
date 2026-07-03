import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AppUser {
  sub:     string;
  name:    string;
  email:   string;
  picture: string;
  phone?:   string;    
  isGuest?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey  = 'auth_user';

  user:  AppUser | null = null;
  token: string | null  = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async restoreSession(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedToken   = sessionStorage.getItem(this.tokenKey);
    const storedUserRaw = sessionStorage.getItem(this.userKey);

    if (!storedUserRaw) { this.clear(); return; }

    try {
      this.user  = JSON.parse(storedUserRaw);
      this.token = storedToken ?? null;
    } catch { this.clear(); }
  }

  async signInWithGoogle(credential: string): Promise<void> {
    const payload = this.parseJwt(credential);
    this.token    = credential;
    this.user     = {
      sub:     payload.sub,
      name:    payload.name,
      email:   payload.email,
      picture: payload.picture,
    };
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.tokenKey, credential);
      sessionStorage.setItem(this.userKey,  JSON.stringify(this.user));
    }
  }

  async signInWithEmail(user: AppUser, token: string): Promise<void> {
    this.user  = user;
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.tokenKey, token);
      sessionStorage.setItem(this.userKey,  JSON.stringify(user));
    }
  }

  async signInAsGuest(user: AppUser, token: string): Promise<void> {
    this.user  = user;
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.tokenKey, token);
      sessionStorage.setItem(this.userKey,  JSON.stringify(user));
    }
  }

  async logout(): Promise<void> { this.clear(); }

  private clear(): void {
    this.token = null;
    this.user  = null;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
    }
  }

  parseJwt(token: string): any {
    const parts  = token.split('.');
    if (parts.length < 2) throw new Error('Invalid JWT');
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  }
}
