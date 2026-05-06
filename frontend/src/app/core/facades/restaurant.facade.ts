import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { RestaurantService, Restaurant } from '../services/domain/restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantFacade {
  private readonly restaurantService = inject(RestaurantService);

  // Estados internos
  private readonly restaurantsSubject = new BehaviorSubject<Restaurant[]>([]);
  private readonly selectedRestaurantSubject = new BehaviorSubject<Restaurant | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Observables publicos
  public readonly restaurants$ = this.restaurantsSubject.asObservable();
  public readonly selectedRestaurant$ = this.selectedRestaurantSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();

  /**
   * Carga todos los restaurantes (para superadmin o gestion multi-restaurante)
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
   * Carga un restaurante específico y lo establece como seleccionado
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
   * Crea un nuevo restaurante
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
   * Actualiza los datos de un restaurante
   */
  updateRestaurant(uuid: string, data: Partial<Restaurant>): Observable<Restaurant> {
    this.loadingSubject.next(true);
    return this.restaurantService.update(uuid, data).pipe(
      tap((updatedRestaurant) => {
        // Actualiza la lista de restaurantes
        const current = this.restaurantsSubject.getValue();
        const index = current.findIndex(r => r.uuid === uuid);
        if (index !== -1) {
          current[index] = updatedRestaurant;
          this.restaurantsSubject.next([...current]);
        }
        // Actualiza la selección si el restaurante editado es el seleccionado
        const selected = this.selectedRestaurantSubject.getValue();
        if (selected?.uuid === uuid) {
          this.selectedRestaurantSubject.next(updatedRestaurant);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Elimina un restaurante y actualiza el estado
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
   * Seleccion manual de un restaurante
   */
  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurantSubject.next(restaurant);
  }

  /**
   * Limpiar la seleccion actual
   */
  clearSelection(): void {
    this.selectedRestaurantSubject.next(null);
  }
}
