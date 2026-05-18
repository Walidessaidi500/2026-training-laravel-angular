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
    filteredAmount: number;
    filteredLabel: string;
    filteredRange: string;
  };
  metrics: {
    activeUsers: number;
    activeUsersTrend: number;
    ordersToday: number;
    ordersTodayTrend: number;
    conversionRate: number;
    conversionRateTrend: number;
    totalProducts: number;
    totalProductsTrend: number;
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

  private allSales: any[] = [];

  // Estados
  private readonly dashboardDataSubject = new BehaviorSubject<DashboardData>({
    revenue: { 
      total: 0, trendPercentage: 0, thisWeek: 0, avgOrder: 0, mrr: 0,
      filteredAmount: 0, filteredLabel: 'INGRESOS SEMANALES', filteredRange: '7d'
    },
    metrics: { 
      activeUsers: 0, activeUsersTrend: 0, 
      ordersToday: 0, ordersTodayTrend: 0, 
      conversionRate: 0, conversionRateTrend: 0, 
      totalProducts: 0, totalProductsTrend: 0 
    },
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
        const sales = results.sales.data;
        this.allSales = sales;
        
        // --- Calculos de Ingresos ---
        const totalRevenueCents = sales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0);
        const totalRevenue = totalRevenueCents / 100;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);

        const salesToday = sales.filter(s => new Date(s.created_at).getTime() >= startOfDay);
        const salesThisWeek = sales.filter(s => new Date(s.created_at).getTime() >= sevenDaysAgo);
        
        const revenueThisWeek = salesThisWeek.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0) / 100;
        
        // Tendencia: Comparar ultimos 30 dias con los 30 anteriores (simulado con los datos que tenemos)
        const thirtyDaysAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = now.getTime() - (60 * 24 * 60 * 60 * 1000);
        
        const last30DaysRevenue = sales.filter(s => new Date(s.created_at).getTime() >= thirtyDaysAgo)
                                       .reduce((acc, s) => acc + (Number(s.total) || 0), 0);
        const prev30DaysRevenue = sales.filter(s => {
          const t = new Date(s.created_at).getTime();
          return t >= sixtyDaysAgo && t < thirtyDaysAgo;
        }).reduce((acc, s) => acc + (Number(s.total) || 0), 0);
        
        let revenueTrend = 0;
        if (prev30DaysRevenue > 0) {
          revenueTrend = Number(((last30DaysRevenue - prev30DaysRevenue) / prev30DaysRevenue * 100).toFixed(1));
        } else if (last30DaysRevenue > 0) {
          revenueTrend = 100;
        }

        // --- Calculos de Metricas ---
        const activeUsers = results.users.meta ? results.users.meta.total : results.users.data.length;
        const totalProducts = results.products.meta ? results.products.meta.total : results.products.data.length;
        
        // Items por ticket como "tasa de conversion/eficiencia"
        const totalItems = sales.reduce((acc, s) => {
          if (s.lines && Array.isArray(s.lines)) {
            return acc + s.lines.reduce((lAcc: number, l: any) => lAcc + (Number(l.quantity) || 1), 0);
          }
          return acc + 1;
        }, 0);
        const avgItemsPerTicket = sales.length > 0 ? Number((totalItems / sales.length).toFixed(1)) : 0;

        const newData: DashboardData = {
          ...currentData,
          revenue: {
            ...currentData.revenue,
            total: totalRevenue,
            trendPercentage: revenueTrend,
            thisWeek: revenueThisWeek,
            avgOrder: sales.length > 0 ? totalRevenue / sales.length : 0,
            mrr: last30DaysRevenue / 100, // Monthly Revenue (Actual last 30 days)
            filteredAmount: revenueThisWeek,
            filteredLabel: 'INGRESOS SEMANALES',
            filteredRange: '7d'
          },
          metrics: {
            activeUsers: activeUsers,
            activeUsersTrend: 12.5, // Simulado
            ordersToday: salesToday.length,
            ordersTodayTrend: 8.2, // Simulado
            conversionRate: avgItemsPerTicket, 
            conversionRateTrend: -0.8, // Simulado
            totalProducts: totalProducts,
            totalProductsTrend: 3.0 // Simulado
          },
          recentOrders: this.mapRecentSales(sales.slice(0, 10)),
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

