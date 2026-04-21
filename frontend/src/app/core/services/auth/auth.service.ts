import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  uuid: string;
  name: string;
  email: string;
  role: string;
  restaurant_id?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.hasToken()) {
      this.refreshUser().subscribe();
    }
  }

  refreshUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => this.setUser(user)),
      catchError((error) => {

        if (error.status === 401 || error.status === 403) {
          this.logout();
        }
        return of(null);
      })
    );
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
        }),
        switchMap(() => this.http.get<User>(`${this.apiUrl}/me`)),
        tap((user) => {
          this.setUser(user);
        })
      );
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): User | null {
    return this.userSubject.getValue();
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private setUser(user: User): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  private removeUser(): void {
    localStorage.removeItem('auth_user');
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.getValue();
  }
}
