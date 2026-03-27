import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
} from '@ionic/angular/standalone';
import { StatCardComponent } from '@components/stat-card/stat-card.component';
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
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    StatCardComponent,
  ],
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
      },
      error: (error) => console.error('Error loading products:', error),
    });

    // Cargar familias
    this.familyService.list().subscribe({
      next: (response) => {
        this.totalFamilies = response.meta.total;
        this.activeFamilies = response.data.filter((f) => f.active).length;
      },
      error: (error) => console.error('Error loading families:', error),
    });

    // Cargar impuestos
    this.taxService.list().subscribe({
      next: (response) => {
        this.totalTaxes = response.meta.total;
      },
      error: (error) => console.error('Error loading taxes:', error),
    });

    // Cargar zonas
    this.zoneService.list().subscribe({
      next: (response) => {
        this.totalZones = response.meta.total;
      },
      error: (error) => console.error('Error loading zones:', error),
    });

    // Cargar órdenes
    this.orderService.list().subscribe({
      next: (response) => {
        this.totalOrders = response.meta.total;
        this.openOrders = response.data.filter((o) => o.status === 'open').length;
      },
      error: (error) => console.error('Error loading orders:', error),
    });

    // Cargar usuarios
    this.userService.list().subscribe({
      next: (response) => {
        this.totalUsers = response.meta.total;
      },
      error: (error) => console.error('Error loading users:', error),
    });

    // Cargar ventas
    this.saleService.list().subscribe({
      next: (response) => {
        this.totalSales = response.meta.total;
        this.totalRevenue = response.data.reduce((sum, sale) => sum + sale.total, 0);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.isLoading = false;
      },
    });
  }
}
