import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, forkJoin, tap } from 'rxjs';
import { ProductService, Product } from '../services/domain/product.service';
import { FamilyService, Family } from '../services/domain/family.service';
import { TaxService, Tax } from '../services/domain/tax.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryFacade {
  private readonly productService = inject(ProductService);
  private readonly familyService = inject(FamilyService);
  private readonly taxService = inject(TaxService);

  // State (Subjects)
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  private readonly familiesSubject = new BehaviorSubject<Family[]>([]);
  private readonly taxesSubject = new BehaviorSubject<Tax[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Observables (Exposed to components)
  public readonly products$ = this.productsSubject.asObservable();
  public readonly families$ = this.familiesSubject.asObservable();
  public readonly taxes$ = this.taxesSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();

  /**
   * Initial load of all necessary data for Inventory management
   */
  loadAll(): void {
    this.loadingSubject.next(true);

    forkJoin({
      products: this.productService.list(1, 1000),
      families: this.familyService.list(),
      taxes: this.taxService.list()
    }).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: ({ products, families, taxes }) => {
        this.productsSubject.next(products.data);
        this.familiesSubject.next(families.data);
        this.taxesSubject.next(taxes.data);
      },
      error: (error) => console.error('Error loading inventory data:', error)
    });
  }

  // --- Product Operations ---

  createProduct(data: any): Observable<Product> {
    this.loadingSubject.next(true);
    return this.productService.create(data).pipe(
      tap((newProduct) => {
        const current = this.productsSubject.getValue();
        this.productsSubject.next([newProduct, ...current]);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateProduct(uuid: string, data: any): Observable<Product> {
    this.loadingSubject.next(true);
    return this.productService.update(uuid, data).pipe(
      tap((updatedProduct) => {
        const current = this.productsSubject.getValue();
        const index = current.findIndex(p => p.uuid === uuid);
        if (index !== -1) {
          current[index] = updatedProduct;
          this.productsSubject.next([...current]);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteProduct(uuid: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.productService.delete(uuid).pipe(
      tap(() => {
        const current = this.productsSubject.getValue();
        this.productsSubject.next(current.filter(p => p.uuid !== uuid));
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  toggleProductStatus(uuid: string): Observable<Product> {
    return this.productService.toggle(uuid).pipe(
      tap((updatedProduct) => {
        const current = this.productsSubject.getValue();
        const index = current.findIndex(p => p.uuid === uuid);
        if (index !== -1) {
          current[index] = updatedProduct;
          this.productsSubject.next([...current]);
        }
      })
    );
  }

  // --- Helpers ---

  /**
   * Refreshes families list
   */
  refreshFamilies(): void {
    this.familyService.list().subscribe(res => this.familiesSubject.next(res.data));
  }

  /**
   * Refreshes taxes list
   */
  refreshTaxes(): void {
    this.taxService.list().subscribe(res => this.taxesSubject.next(res.data));
  }
}
