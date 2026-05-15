import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, forkJoin, finalize, tap, Observable, map } from 'rxjs';
import { ProductService } from '../services/domain/product.service';
import { FamilyService } from '../services/domain/family.service';
import { TaxService } from '../services/domain/tax.service';
import { ZoneService } from '../services/domain/zone.service';
import { OrderService } from '../services/domain/order.service';
import { UserService, User } from '../services/domain/user.service';
import { SaleService } from '../services/domain/sale.service';
import { TableService } from '../services/domain/table.service';
import { AuthService } from '../services/auth/auth.service';

export interface DashboardData {
  revenue: {
    total: number;
    trendPercentage: number;
    thisWeek: number;
    avgOrder: number;
    mrr: number;
  };
  metrics: {
    activeUsers: number;
    ordersToday: number;
    conversionRate: number;
    totalProducts: number;
  };
  recentOrders: any[];
  alerts: any[];
  activities: any[];
  tables: any[];
  users: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardFacade {
  private readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly familyService = inject(FamilyService);
  private readonly taxService = inject(TaxService);
  private readonly zoneService = inject(ZoneService);
  private readonly orderService = inject(OrderService);
  private readonly userService = inject(UserService);
  private readonly saleService = inject(SaleService);
  private readonly tableService = inject(TableService);

  // Estados
  private readonly dashboardDataSubject = new BehaviorSubject<DashboardData>({
    revenue: { total: 0, trendPercentage: 0, thisWeek: 0, avgOrder: 0, mrr: 0 },
    metrics: { activeUsers: 0, ordersToday: 0, conversionRate: 0, totalProducts: 0 },
    recentOrders: [],
    alerts: [],
    activities: [],
    tables: [],
    users: [],
  });
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Observables para que los componentes se suscriban
  public readonly dashboardData$ = this.dashboardDataSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();

  /**
   * Carga las estadisticas para el dashboard
   */
  loadStatistics(): void {
    const currentUser = this.authService.getUser();
    const restaurantId = currentUser?.restaurant_id;

    if (!currentUser || currentUser.role !== 'admin') {
      this.addAlert({
        type: 'danger',
        title: 'Acceso denegado',
        description: 'No tienes permisos para ver este dashboard. Requiere rol de administrador.',
        timeAgo: 'Ahora',
      });
      return;
    }

    this.loadingSubject.next(true);

    // Agregar la alerta de bienvenida
    if (this.dashboardDataSubject.getValue().activities.length === 0) {
      this.addAlert({
        type: 'success',
        title: '¡Bienvenido!',
        description: `Dashboard del Restaurante #${restaurantId} - ${currentUser.name}`,
        timeAgo: 'Hace unos momentos',
      });

      this.addActivity({
        type: 'login',
        icon: 'person',
        title: 'Sesión iniciada',
        description: `${currentUser.name} inició sesión como administrador`,
        timeAgo: 'Hace unos segundos',
      });
    }

    forkJoin({
      products: this.productService.list(1, 1000),
      families: this.familyService.list(),
      taxes: this.taxService.list(),
      users: this.userService.list(1, 1000),
      sales: this.saleService.list(1, 1000),
      orders: this.orderService.list(1, 1000),
      tables: this.tableService.list()
    }).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (results) => {
        const currentData = this.dashboardDataSubject.getValue();
        
        // Calcula el total de ingresos sumando el total de cada venta (ticket cerrado)
        const totalRevenueCents = results.sales.data.reduce((acc, sale) => {
          return acc + (Number(sale.total) || 0);
        }, 0);
        
        const totalRevenue = totalRevenueCents / 100;
        
        const newData: DashboardData = {
          ...currentData,
          revenue: {
            ...currentData.revenue,
            total: totalRevenue,
            thisWeek: totalRevenue, // Se podria calcular solo por semana
            avgOrder: results.sales.data.length > 0 ? totalRevenue / results.sales.data.length : 0,
          },
          metrics: {
            activeUsers: results.users.meta ? results.users.meta.total : results.users.data.length,
            ordersToday: results.sales.meta ? results.sales.meta.total : results.sales.data.length,
            conversionRate: 15.4, 
            totalProducts: results.products.meta ? results.products.meta.total : results.products.data.length,
          },
          recentOrders: this.mapRecentSales(results.sales.data.slice(0, 10)),
          tables: results.tables.data || results.tables,
          users: results.users.data || results.users
        };

        this.dashboardDataSubject.next(newData);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.addAlert({
          type: 'danger',
          title: 'Error de carga',
          description: 'No se pudieron sincronizar los datos del restaurante.',
          timeAgo: 'Ahora',
        });
      }
    });
  }

  private mapRecentSales(sales: any[]): any[] {
    return sales.map(sale => {
      let itemsCount = 0;

      if (sale.lines && Array.isArray(sale.lines)) {
        itemsCount = sale.lines.reduce((acc: number, line: any) => acc + (Number(line.quantity) || 1), 0);
      }
      
      return {
        uuid: sale.uuid,
        id: sale.uuid ? sale.uuid.substring(0, 8) : '00000000',
        customerName: `Ticket #${sale.ticket_number || 'S/N'}`,
        customerInitials: 'T',
        itemsCount: itemsCount,
        total: (Number(sale.total) || 0) / 100,
        date: sale.created_at ? new Date(sale.created_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
        status: 'Completed',
        colorAvatar: 'var(--ion-color-success)',
        originalData: sale
      };
    });
  }

  public addAlert(alert: any): void {
    const current = this.dashboardDataSubject.getValue();
    this.dashboardDataSubject.next({
      ...current,
      alerts: [alert, ...current.alerts]
    });
  }

  public addActivity(activity: any): void {
    const current = this.dashboardDataSubject.getValue();
    this.dashboardDataSubject.next({
      ...current,
      activities: [activity, ...current.activities]
    });
  }

  // Servicios para obtener los datos
  
  getFamilies(): Observable<any[]> {
    return this.familyService.list().pipe(map(res => res.data));
  }

  getProducts(): Observable<any[]> {
    return this.productService.list(1, 1000).pipe(map(res => res.data));
  }

  getTaxes(): Observable<any[]> {
    return this.taxService.list().pipe(map(res => res.data));
  }

  getTables(): Observable<any[]> {
    return this.tableService.list().pipe(map((res: any) => res.data || res));
  }

  getUsers(): Observable<any[]> {
    return this.userService.list(1, 1000).pipe(map(res => res.data));
  }

  getZones(): Observable<any[]> {
    return this.zoneService.list().pipe(map(res => res.data));
  }
}

