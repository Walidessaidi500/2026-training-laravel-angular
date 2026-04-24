import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { UserService, User } from '../services/domain/user.service';

@Injectable({
  providedIn: 'root'
})
export class UsersFacade {
  private readonly userService = inject(UserService);

  // State
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly totalUsersSubject = new BehaviorSubject<number>(0);

  // Exposed Observables
  public readonly users$ = this.usersSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();
  public readonly totalUsers$ = this.totalUsersSubject.asObservable();

  /**
   * Load users with pagination
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
   * Create a new user and update local state
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
   * Update an existing user
   */
  updateUser(uuid: string, userData: Partial<User>): Observable<User> {
    this.loadingSubject.next(true);
    return this.userService.update(uuid, userData).pipe(
      tap((updatedUser) => {
        const current = this.usersSubject.getValue();
        const index = current.findIndex(u => u.uuid === uuid);
        if (index !== -1) {
          current[index] = updatedUser;
          this.usersSubject.next([...current]);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Delete a user and update local state
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

  /**
   * Toggle user active status
   */
  toggleUserStatus(uuid: string): Observable<User> {
    return this.userService.toggleActive(uuid).pipe(
      tap((updatedUser) => {
        const current = this.usersSubject.getValue();
        const index = current.findIndex(u => u.uuid === uuid);
        if (index !== -1) {
          current[index] = updatedUser;
          this.usersSubject.next([...current]);
        }
      })
    );
  }
}
