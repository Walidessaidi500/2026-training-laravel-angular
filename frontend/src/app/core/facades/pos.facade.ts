import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, forkJoin, map, of, tap, catchError, switchMap } from 'rxjs';
import { OrderService, Order } from '../services/domain/order.service';
import { TableService, Table } from '../services/domain/table.service';
import { ZoneService, Zone } from '../services/domain/zone.service';
import { ProductService, Product } from '../services/domain/product.service';
import { UserService, User } from '../services/domain/user.service';
import { FamilyService, Family } from '../services/domain/family.service';
import { TaxService, Tax } from '../services/domain/tax.service';
import { SaleService } from '../services/domain/sale.service';

@Injectable({
  providedIn: 'root'
})
export class POSFacade {
  private readonly orderService = inject(OrderService);
  private readonly tableService = inject(TableService);
  private readonly zoneService = inject(ZoneService);
  private readonly productService = inject(ProductService);
  private readonly userService = inject(UserService);
  private readonly familyService = inject(FamilyService);
  private readonly taxService = inject(TaxService);
  private readonly saleService = inject(SaleService);

  // --- State ---
  private readonly zonesSubject = new BehaviorSubject<Zone[]>([]);
  private readonly tablesSubject = new BehaviorSubject<Table[]>([]);
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  private readonly familiesSubject = new BehaviorSubject<Family[]>([]);
  private readonly taxesSubject = new BehaviorSubject<Tax[]>([]);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  
  private readonly selectedZoneSubject = new BehaviorSubject<Zone | null>(null);
  private readonly selectedTableSubject = new BehaviorSubject<Table | null>(null);
  private readonly activeOrderSubject = new BehaviorSubject<Order | null>(null);
  
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // --- Exposed Observables ---
  public readonly zones$ = this.zonesSubject.asObservable();
  public readonly tables$ = this.tablesSubject.asObservable();
  public readonly products$ = this.productsSubject.asObservable();
  public readonly users$ = this.usersSubject.asObservable();
  public readonly families$ = this.familiesSubject.asObservable();
  public readonly taxes$ = this.taxesSubject.asObservable();
  public readonly orders$ = this.ordersSubject.asObservable();
  
  public readonly selectedZone$ = this.selectedZoneSubject.asObservable();
  public readonly selectedTable$ = this.selectedTableSubject.asObservable();
  public readonly activeOrder$ = this.activeOrderSubject.asObservable();
  
  public readonly isLoading$ = this.loadingSubject.asObservable();

  /**
   * Initial load for POS: Zones, Tables, Products, Families, Taxes, Orders and Users
   */
  initializePOS(): void {
    this.loadingSubject.next(true);
    
    forkJoin({
      zones: this.zoneService.list(1, 100),
      tables: this.tableService.list(1, 500),
      products: this.productService.list(1, 1000, true),
      families: this.familyService.list(true),
      taxes: this.taxService.list(),
      orders: this.orderService.list(1, 1000),
      users: this.userService.list(1, 100).pipe(
        map(res => res.data.filter(u => u.role === 'operator' || u.role === 'supervisor')),
        catchError(() => of([]))
      )
    }).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: ({ zones, tables, products, families, taxes, orders, users }) => {
        this.zonesSubject.next(zones.data);
        this.tablesSubject.next(tables.data);
        this.productsSubject.next(products.data);
        this.familiesSubject.next(families.data);
        this.taxesSubject.next(taxes.data);
        this.ordersSubject.next(orders.data);
        this.usersSubject.next(users);
        
        // Auto-select first zone if available
        if (zones.data.length > 0) {
          this.selectZone(zones.data[0]);
        }
      },
      error: (err) => console.error('Error initializing POS:', err)
    });
  }

  /**
   * Select a zone
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
   * Syncs current order lines with the backend
   */
  syncOrder(orderData: any): Observable<any> {
    this.loadingSubject.next(true);
    return this.orderService.sync(orderData).pipe(
      switchMap(() => this.orderService.getActiveOrderByTable(orderData.table_uuid)),
      tap(updatedOrder => {
        this.activeOrderSubject.next(updatedOrder);
        this.refreshOrders(); // Refrescar lista global de pedidos
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Processes a sale (closes ticket)
   */
  processSale(saleData: any): Observable<any> {
    this.loadingSubject.next(true);
    return this.saleService.process(saleData).pipe(
      tap(() => {
        this.activeOrderSubject.next(null);
        this.selectedTableSubject.next(null);
        this.refreshOrders(); // Refrescar tras cerrar venta
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Clears selection
   */
  clearSelection(): void {
    this.selectedTableSubject.next(null);
    this.activeOrderSubject.next(null);
  }

  /**
   * Refresh products (usually after a sale to update stock)
   */
  refreshProducts(): void {
    this.productService.list(1, 1000, true).subscribe(res => {
      this.productsSubject.next(res.data);
    });
  }

  /**
   * Refresh all orders
   */
  refreshOrders(): void {
    this.orderService.list(1, 1000).subscribe(res => {
      this.ordersSubject.next(res.data);
    });
  }

  // --- Derived State Helpers ---

  getTablesBySelectedZone(): Observable<Table[]> {
    return forkJoin({
      tables: this.tables$,
      zone: this.selectedZone$
    }).pipe(
      map(({ tables, zone }) => {
        if (!zone) return [];
        return tables.filter(t => t.zone_id === zone.uuid);
      })
    );
  }
}
