import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { RestaurantService, Restaurant } from '../services/domain/restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantFacade {
  private readonly restaurantService = inject(RestaurantService);

  // --- State ---
  private readonly restaurantsSubject = new BehaviorSubject<Restaurant[]>([]);
  private readonly selectedRestaurantSubject = new BehaviorSubject<Restaurant | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // --- Exposed Observables ---
  public readonly restaurants$ = this.restaurantsSubject.asObservable();
  public readonly selectedRestaurant$ = this.selectedRestaurantSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();

  /**
   * Load all restaurants (for superadmin or multi-restaurant management)
   */
  loadRestaurants(): void {
    this.loadingSubject.next(true);
    this.restaurantService.list().pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (response) => this.restaurantsSubject.next(response.data),
      error: (err) => console.error('Error loading restaurants:', err)
    });
  }

  /**
   * Load a specific restaurant and set it as selected
   */
  loadRestaurant(uuid: string): void {
    this.loadingSubject.next(true);
    this.restaurantService.get(uuid).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (restaurant) => this.selectedRestaurantSubject.next(restaurant),
      error: (err) => console.error('Error loading restaurant:', err)
    });
  }

  /**
   * Create a new restaurant
   */
  createRestaurant(data: Partial<Restaurant>): Observable<Restaurant> {
    this.loadingSubject.next(true);
    return this.restaurantService.create(data).pipe(
      tap((newRestaurant) => {
        const current = this.restaurantsSubject.getValue();
        this.restaurantsSubject.next([newRestaurant, ...current]);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Update restaurant details
   */
  updateRestaurant(uuid: string, data: Partial<Restaurant>): Observable<Restaurant> {
    this.loadingSubject.next(true);
    return this.restaurantService.update(uuid, data).pipe(
      tap((updatedRestaurant) => {
        // Update in list
        const current = this.restaurantsSubject.getValue();
        const index = current.findIndex(r => r.uuid === uuid);
        if (index !== -1) {
          current[index] = updatedRestaurant;
          this.restaurantsSubject.next([...current]);
        }
        // Update selected if applicable
        const selected = this.selectedRestaurantSubject.getValue();
        if (selected?.uuid === uuid) {
          this.selectedRestaurantSubject.next(updatedRestaurant);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Delete a restaurant
   */
  deleteRestaurant(uuid: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.restaurantService.delete(uuid).pipe(
      tap(() => {
        const current = this.restaurantsSubject.getValue();
        this.restaurantsSubject.next(current.filter(r => r.uuid !== uuid));
        
        if (this.selectedRestaurantSubject.getValue()?.uuid === uuid) {
          this.selectedRestaurantSubject.next(null);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Manual selection of a restaurant from the state
   */
  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurantSubject.next(restaurant);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedRestaurantSubject.next(null);
  }
}
