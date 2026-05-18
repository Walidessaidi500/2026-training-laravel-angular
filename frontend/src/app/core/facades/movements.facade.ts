import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { MovementService, MovementResponse, Movement } from '../services/domain/movement.service';

@Injectable({
  providedIn: 'root'
})
export class MovementsFacade {
  private readonly movementService = inject(MovementService);

  private readonly movementsSubject = new BehaviorSubject<Movement[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly metaSubject = new BehaviorSubject<any>(null);

  public readonly movements$ = this.movementsSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();
  public readonly meta$ = this.metaSubject.asObservable();

  loadMovements(page: number = 1, perPage: number = 50): void {
    this.loadingSubject.next(true);
    this.movementService.list(page, perPage)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (response: MovementResponse) => {
          this.movementsSubject.next(response.data);
          this.metaSubject.next(response.meta);
        },
        error: (err) => {
          console.error('Error loading movements', err);
        }
      });
  }
}
