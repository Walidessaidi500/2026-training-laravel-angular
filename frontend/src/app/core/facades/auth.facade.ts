import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { AuthService, LoginRequest, User } from '../services/auth/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // State
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Exposed Observables
  public readonly user$ = this.authService.user$;
  public readonly isAuthenticated$ = this.authService.isAuthenticated$;
  public readonly isLoading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  /**
   * Performs login and redirects based on user role
   */
  login(credentials: LoginRequest): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.authService.login(credentials).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (user) => {
        this.redirectByUserRole(user.role);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorSubject.next('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
      }
    });
  }

  /**
   * Logs out the user and redirects to login page
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Helper to check if current user has a specific role
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Returns current user snapshot
   */
  getCurrentUser(): User | null {
    return this.authService.getUser();
  }

  /**
   * Logic to redirect users after login
   */
  private redirectByUserRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'supervisor':
        this.router.navigate(['/supervisor']);
        break;
      case 'employee':
        this.router.navigate(['/employee/tpv']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  /**
   * Clears any active error message
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
