import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { ProductService } from '@services/domain/product.service';
import { FamilyService } from '@services/domain/family.service';
import { TaxService } from '@services/domain/tax.service';
import { ZoneService } from '@services/domain/table.service';
import { OrderService } from '@services/domain/order.service';
import { UserService } from '@services/domain/user.service';
import { SaleService } from '@services/domain/sale.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardPage implements OnInit {
  // Productos
  totalProducts = 0;
  activeProducts = 0;

  // Familias
  totalFamilies = 0;
  activeFamilies = 0;

  // Impuestos
  totalTaxes = 0;

  // Zonas
  totalZones = 0;

  // Órdenes
  totalOrders = 0;
  openOrders = 0;

  // Usuarios
  totalUsers = 0;

  // Ventas
  totalSales = 0;
  totalRevenue = 0;

  isLoading = true;

  dashboardData = {
    revenue: {
      total: 0,
      trendPercentage: 0,
      thisWeek: 0,
      avgOrder: 0,
      mrr: 0,
    },
    metrics: {
      activeUsers: 0,
      ordersToday: 0,
      conversionRate: 0,
      totalProducts: 0,
    },
    recentOrders: [] as any[],
    alerts: [] as any[],
    activities: [] as any[],
  };

  constructor(
    private productService: ProductService,
    private familyService: FamilyService,
    private taxService: TaxService,
    private zoneService: ZoneService,
    private orderService: OrderService,
    private userService: UserService,
    private saleService: SaleService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    // Cargar productos
    this.productService.list().subscribe({
      next: (response) => {
        this.totalProducts = response.meta.total;
        this.activeProducts = response.data.filter((p) => p.active).length;
        this.dashboardData.metrics.totalProducts = this.totalProducts;
      },
      error: (error) => console.error('Error cargando los productos:', error),
    });

    // Cargar familias
    this.familyService.list().subscribe({
      next: (response) => {
        this.totalFamilies = response.meta.total;
        this.activeFamilies = response.data.filter((f) => f.active).length;
      },
      error: (error) => console.error('Error cargando las familias:', error),
    });

    // Cargar impuestos
    this.taxService.list().subscribe({
      next: (response) => {
        this.totalTaxes = response.meta.total;
      },
      error: (error) => console.error('Error cargando los impuestos:', error),
    });

    // Cargar zonas
    this.zoneService.list().subscribe({
      next: (response) => {
        this.totalZones = response.meta.total;
      },
      error: (error) => console.error('Error cargando las zonas:', error),
    });

    // Cargar órdenes
    this.orderService.list().subscribe({
      next: (response) => {
        this.totalOrders = response.meta.total;
        this.openOrders = response.data.filter((o) => o.status === 'open').length;
        this.dashboardData.metrics.ordersToday = this.openOrders;
        this.dashboardData.recentOrders = response.data.slice(0, 5) as any[];
      },
      error: (error) => console.error('Error cargando los pedidos:', error),
    });

    // Cargar usuarios
    this.userService.list().subscribe({
      next: (response) => {
        this.totalUsers = response.meta.total;
        this.dashboardData.metrics.activeUsers = this.totalUsers;
      },
      error: (error) => console.error('Error cargando los usuarios:', error),
    });

    // Cargar ventas
    this.saleService.list().subscribe({
      next: (response) => {
        this.totalSales = response.meta.total;
        this.totalRevenue = response.data.reduce((sum, sale) => sum + sale.total, 0);
        this.dashboardData.revenue.total = this.totalRevenue;
        this.dashboardData.revenue.thisWeek = this.totalRevenue * 0.3;
        this.dashboardData.revenue.avgOrder = this.totalRevenue / Math.max(this.totalSales, 1);
        this.dashboardData.revenue.mrr = this.totalRevenue;
        this.dashboardData.revenue.trendPercentage = 12.5;
        this.dashboardData.metrics.conversionRate = 3.5;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando las ventas:', error);
        this.isLoading = false;
      },
    });
  }

  crearOrden(): void {
    console.log('Crear una nueva orden');
    // TODO: Implementar navegación a crear orden
  }

  agregarProducto(): void {
    console.log('Agregar un nuevo producto');
    // TODO: Implementar navegación a crear producto
  }
}
