import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, forkJoin, of, tap } from 'rxjs';
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
      tap(() => {
        const current = this.productsSubject.getValue();
        const index = current.findIndex(p => p.uuid === uuid);
        if (index !== -1) {
          // Patch locally since backend might not return the full updated object
          current[index] = { ...current[index], ...data } as Product;
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

  // --- Helpers: Families ---

  createFamily(data: any): Observable<Family> {
    this.loadingSubject.next(true);
    return this.familyService.create(data).pipe(
      tap((newFamily) => {
        const current = this.familiesSubject.getValue();
        this.familiesSubject.next([...current, newFamily]);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateFamily(uuid: string, data: any): Observable<Family> {
    this.loadingSubject.next(true);
    return this.familyService.update(uuid, data).pipe(
      tap(() => {
        const current = this.familiesSubject.getValue();
        const index = current.findIndex(f => f.uuid === uuid);
        if (index !== -1) {
          current[index] = { ...current[index], ...data } as Family;
          this.familiesSubject.next([...current]);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteFamily(uuid: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.familyService.delete(uuid).pipe(
      tap(() => {
        const current = this.familiesSubject.getValue();
        this.familiesSubject.next(current.filter(f => f.uuid !== uuid));
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  toggleFamilyStatus(uuid: string): Observable<Family> {
    const current = this.familiesSubject.getValue();
    const family = current.find(f => f.uuid === uuid);
    if (!family) return of(null as any);

    const newStatus = !family.active;
    return this.familyService.update(uuid, { ...family, active: newStatus }).pipe(
      tap((updated) => {
        const index = current.findIndex(f => f.uuid === uuid);
        if (index !== -1) {
          current[index] = updated;
          this.familiesSubject.next([...current]);
        }
      })
    );
  }

  // --- Helpers: Taxes ---

  createTax(data: any): Observable<Tax> {
    this.loadingSubject.next(true);
    return this.taxService.create(data).pipe(
      tap((newTax) => {
        const current = this.taxesSubject.getValue();
        this.taxesSubject.next([...current, newTax]);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateTax(uuid: string, data: any): Observable<Tax> {
    this.loadingSubject.next(true);
    return this.taxService.update(uuid, data).pipe(
      tap(() => {
        const current = this.taxesSubject.getValue();
        const index = current.findIndex(t => t.uuid === uuid);
        if (index !== -1) {
          current[index] = { ...current[index], ...data } as Tax;
          this.taxesSubject.next([...current]);
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteTax(uuid: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.taxService.delete(uuid).pipe(
      tap(() => {
        const current = this.taxesSubject.getValue();
        this.taxesSubject.next(current.filter(t => t.uuid !== uuid));
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

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
