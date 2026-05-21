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

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  public readonly user$ = this.authService.user$;
  public readonly isAuthenticated$ = this.authService.isAuthenticated$;
  public readonly isLoading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();


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


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  // Helper para verificar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }


  // Devuelve el usuario actual o null si no hay ninguno autenticado
  getCurrentUser(): User | null {
    return this.authService.getUser();
  }


  // Logica para redirigir a los usuarios después de iniciar sesión
  private redirectByUserRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'supervisor':
        this.router.navigate(['/supervisor']);
        break;
      case 'employee':
      case 'restaurant':
        this.router.navigate(['/tpv']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }


  clearError(): void {
    this.errorSubject.next(null);
  }
}
