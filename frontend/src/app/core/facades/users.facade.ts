import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { UserService, User } from '../services/domain/user.service';

@Injectable({
  providedIn: 'root'
})
export class UsersFacade {
  private readonly userService = inject(UserService);

  // Estados internos
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly totalUsersSubject = new BehaviorSubject<number>(0);

  // Observables publicos
  public readonly users$ = this.usersSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();
  public readonly totalUsers$ = this.totalUsersSubject.asObservable();

  /**
   * Carga la lista de usuarios con paginación
   */
  loadUsers(page: number = 1, perPage: number = 10): void {
    this.loadingSubject.next(true);
    this.userService.list(page, perPage).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (response) => {
        this.usersSubject.next(response.data);
        this.totalUsersSubject.next(response.meta.total);
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  /**
   * Crear un nuevo usuario y actualizar el estado
   */
  createUser(userData: Partial<User>): Observable<User> {
    this.loadingSubject.next(true);
    return this.userService.create(userData).pipe(
      tap((newUser) => {
        const current = this.usersSubject.getValue();
        this.usersSubject.next([newUser, ...current]);
        this.totalUsersSubject.next(this.totalUsersSubject.getValue() + 1);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Actualizar un usuario existente
   */
  updateUser(uuid: string, userData: Partial<User>): Observable<User> {
    this.loadingSubject.next(true);
    return this.userService.update(uuid, userData).pipe(
      tap(() => {
        const current = this.usersSubject.getValue();
        const index = current.findIndex(u => u.uuid === uuid);
        if (index !== -1) {
          // Actualiza el usuario en la lista
          current[index] = { ...current[index], ...userData } as User;
          this.usersSubject.next([...current]);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Elimina un usuario
   */
  deleteUser(uuid: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.userService.delete(uuid).pipe(
      tap(() => {
        const current = this.usersSubject.getValue();
        this.usersSubject.next(current.filter(u => u.uuid !== uuid));
        this.totalUsersSubject.next(this.totalUsersSubject.getValue() - 1);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
