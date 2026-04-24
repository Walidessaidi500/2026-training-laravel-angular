import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { OrderService, Order, OrderLine } from '../services/domain/order.service';
import { TableService, Table } from '../services/domain/table.service';
import { ZoneService, Zone } from '../services/domain/zone.service';
import { ProductService, Product } from '../services/domain/product.service';

@Injectable({
  providedIn: 'root'
})
export class POSFacade {
  private readonly orderService = inject(OrderService);
  private readonly tableService = inject(TableService);
  private readonly zoneService = inject(ZoneService);
  private readonly productService = inject(ProductService);

  // --- State ---
  private readonly zonesSubject = new BehaviorSubject<Zone[]>([]);
  private readonly tablesSubject = new BehaviorSubject<Table[]>([]);
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  
  private readonly selectedZoneSubject = new BehaviorSubject<Zone | null>(null);
  private readonly selectedTableSubject = new BehaviorSubject<Table | null>(null);
  private readonly activeOrderSubject = new BehaviorSubject<Order | null>(null);
  
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // --- Exposed Observables ---
  public readonly zones$ = this.zonesSubject.asObservable();
  public readonly tables$ = this.tablesSubject.asObservable();
  public readonly products$ = this.productsSubject.asObservable();
  
  public readonly selectedZone$ = this.selectedZoneSubject.asObservable();
  public readonly selectedTable$ = this.selectedTableSubject.asObservable();
  public readonly activeOrder$ = this.activeOrderSubject.asObservable();
  
  public readonly isLoading$ = this.loadingSubject.asObservable();

  /**
   * Initial load for POS: Zones, Tables and Products
   */
  initializePOS(): void {
    this.loadingSubject.next(true);
    
    forkJoin({
      zones: this.zoneService.list(1, 100),
      tables: this.tableService.list(1, 500),
      products: this.productService.list(1, 1000, true) // Only active products
    }).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: ({ zones, tables, products }) => {
        this.zonesSubject.next(zones.data);
        this.tablesSubject.next(tables.data);
        this.productsSubject.next(products.data);
        
        // Auto-select first zone if available
        if (zones.data.length > 0) {
          this.selectZone(zones.data[0]);
        }
      },
      error: (err) => console.error('Error initializing POS:', err)
    });
  }

  /**
   * Select a zone and filter tables implicitly (tables can be filtered in UI via tables$ + selectedZone)
   */
  selectZone(zone: Zone): void {
    this.selectedZoneSubject.next(zone);
  }

  /**
   * Select a table and automatically load its active order if exists
   */
  selectTable(table: Table): void {
    this.selectedTableSubject.next(table);
    this.loadingSubject.next(true);
    
    this.orderService.getActiveOrderByTable(table.uuid).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (order) => this.activeOrderSubject.next(order),
      error: () => this.activeOrderSubject.next(null)
    });
  }

  /**
   * Creates a new order for the currently selected table
   */
  createOrder(diners: number = 1): void {
    const table = this.selectedTableSubject.getValue();
    if (!table) return;

    this.loadingSubject.next(true);
    this.orderService.create({
      table_uuid: table.uuid,
      diners: diners
    }).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (order) => this.activeOrderSubject.next(order),
      error: (err) => console.error('Error creating order:', err)
    });
  }

  /**
   * Syncs current order lines with the backend
   * This is usually called when "sending to kitchen" or updating the command
   */
  syncOrderLines(lines: any[]): Observable<any> {
    const order = this.activeOrderSubject.getValue();
    if (!order) return of(null);

    return this.orderService.sync({
      order_uuid: order.uuid,
      lines: lines
    }).pipe(
      tap(updatedOrder => this.activeOrderSubject.next(updatedOrder))
    );
  }

  /**
   * Closes the current order (payment process)
   */
  closeCurrentOrder(): Observable<Order> {
    const order = this.activeOrderSubject.getValue();
    if (!order) return of(null as any);

    this.loadingSubject.next(true);
    return this.orderService.closeOrder(order.uuid).pipe(
      tap(() => {
        this.activeOrderSubject.next(null);
        // We could also refresh the table status here
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Clears selection (e.g. when leaving the table view)
   */
  clearSelection(): void {
    this.selectedTableSubject.next(null);
    this.activeOrderSubject.next(null);
  }

  // --- Derived State Helpers ---

  /**
   * Returns tables belonging to the selected zone
   */
  getTablesBySelectedZone(): Observable<Table[]> {
    return forkJoin({
      tables: this.tables$,
      zone: this.selectedZone$
    }).pipe(
      map(({ tables, zone }) => {
        if (!zone) return [];
        // Note: adjust 'zone_id' or 'zone_uuid' based on your actual Table interface
        return tables.filter(t => t.zone_id === zone.uuid);
      })
    );
  }
}
