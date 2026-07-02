import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppUser } from './auth-service';

export interface UserRecord {
  name:     string;
  email:    string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

// NEW: backend now returns user + token on login
export interface LoginResponse {
  success: boolean;
  user:    AppUser;
  token:   string;
}

export interface GuestLoginResponse {
  success: boolean;
  user:    AppUser;
  token:   string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  registerUser(user: UserRecord): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, user);
  }

  // CHANGED: calls POST /login instead of GET /:email
  loginUser(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  guestLogin(name: string, phone: string): Observable<GuestLoginResponse> {
    return this.http.post<GuestLoginResponse>(`${this.apiUrl}/guest-login`, { name, phone });
  }
}