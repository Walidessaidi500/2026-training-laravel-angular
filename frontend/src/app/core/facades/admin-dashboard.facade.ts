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

  // State
  private readonly dashboardDataSubject = new BehaviorSubject<DashboardData>({
    revenue: { total: 0, trendPercentage: 0, thisWeek: 0, avgOrder: 0, mrr: 0 },
    metrics: { activeUsers: 0, ordersToday: 0, conversionRate: 0, totalProducts: 0 },
    recentOrders: [],
    alerts: [],
    activities: [],
  });
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Exposed Observables
  public readonly dashboardData$ = this.dashboardDataSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();

  /**
   * Loads all statistics for the dashboard
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

    // Initial welcome alerts/activities if state is empty
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
        
        // Calculate total revenue from orders to match recent orders display
        const totalRevenueCents = results.orders.data.reduce((acc, order) => {
          let orderTotal = 0;
          if (order.lines && Array.isArray(order.lines)) {
            orderTotal = order.lines.reduce((sum: number, line: any) => {
              const price = Number(line.price) || 0;
              const quantity = Number(line.quantity) || 1;
              return sum + (price * quantity);
            }, 0);
          } else if ((order as any).total) {
            orderTotal = Number((order as any).total) || 0;
          }
          return acc + orderTotal;
        }, 0);
        
        const totalRevenue = totalRevenueCents / 100;
        
        const newData: DashboardData = {
          ...currentData,
          revenue: {
            ...currentData.revenue,
            total: totalRevenue,
            thisWeek: totalRevenue, // Mocked for now
            avgOrder: results.orders.data.length > 0 ? totalRevenue / results.orders.data.length : 0,
          },
          metrics: {
            activeUsers: results.users.meta ? results.users.meta.total : results.users.data.length,
            ordersToday: results.orders.meta ? results.orders.meta.total : results.orders.data.length,
            conversionRate: 15.4, // Mocked
            totalProducts: results.products.meta ? results.products.meta.total : results.products.data.length,
          },
          recentOrders: this.mapRecentOrders(results.orders.data)
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

  private mapRecentOrders(orders: any[]): any[] {
    return orders.map(order => {
      let itemsCount = 0;
      let totalCents = 0;

      if (order.lines && Array.isArray(order.lines)) {
        itemsCount = order.lines.reduce((acc: number, line: any) => acc + (Number(line.quantity) || 1), 0);
        totalCents = order.lines.reduce((acc: number, line: any) => acc + ((Number(line.price) || 0) * (Number(line.quantity) || 1)), 0);
      } else if ((order as any).total) {
        totalCents = Number((order as any).total) || 0;
      }
      
      return {
        id: order.uuid ? order.uuid.substring(0, 8) : '00000000',
        customerName: `Pedido #${order.ticket_number || order.id || 'S/N'}`,
        customerInitials: 'P',
        itemsCount: itemsCount,
        total: totalCents / 100,
        date: order.created_at ? new Date(order.created_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
        status: order.status === 'closed' || order.status === 'invoiced' ? 'Completed' : 'Processing',
        colorAvatar: order.status === 'closed' || order.status === 'invoiced' ? 'var(--ion-color-success)' : 'var(--ion-color-primary)'
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

  // --- Common Lists for Forms ---
  
  getFamilies(): Observable<any[]> {
    return this.familyService.list().pipe(map(res => res.data));
  }

  getTaxes(): Observable<any[]> {
    return this.taxService.list().pipe(map(res => res.data));
  }

  getZones(): Observable<any[]> {
    return this.zoneService.list().pipe(map(res => res.data));
  }
}

