import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  chevronForward,
  arrowUp,
  arrowDown,
  people,
  cart,
  pieChart,
  cube,
  arrowForwardOutline,
  checkmarkCircle,
  time,
  closeCircle,
  flashOutline,
  alertCircle,
  warning,
  person,
  cash,
  folder,
  receipt,
  restaurant
} from 'ionicons/icons';
import { AuthService } from '@services/auth/auth.service';
import { ProductService } from '@services/domain/product.service';
import { FamilyService } from '@services/domain/family.service';
import { ZoneService } from '@services/domain/zone.service';
import { OrderService } from '@services/domain/order.service';
import { SaleService } from '@services/domain/sale.service';
import { TableService } from '@services/domain/table.service';
import { AccessDeniedComponent } from '@app/components/access-denied/access-denied.component';
import { ProductFormComponent } from '@app/components/product-form/product-form.component';
import { FamilyFormComponent } from '@app/components/families-form/families-form.component';
import { TablesFormComponent } from '@app/components/tables-form/tables-form.component';
import { MicroStatCardComponent } from '@app/components/micro-stat-card/micro-stat-card.component';
import { ShortcutListComponent, ShortcutItem } from '@app/components/shortcut-list/shortcut-list.component';
import { AlertListComponent } from '@app/components/alert-list/alert-list.component';
import { TimelineListComponent } from '@app/components/timeline-list/timeline-list.component';
interface User {
  uuid: string;
  name: string;
  email: string;
  role: string;
  restaurant_id?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    AccessDeniedComponent,
    CommonModule,
    IonContent,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    ProductFormComponent,
    FamilyFormComponent,
    TablesFormComponent,
    MicroStatCardComponent,
    ShortcutListComponent,
    AlertListComponent,
    TimelineListComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  isSupervisor = false;
  restaurantId: number | undefined;

  families: any[] = [];
  
  totalProducts = 0;
  activeProducts = 0;

  totalFamilies = 0;
  activeFamilies = 0;

  totalZones = 0;

  totalOrders = 0;
  openOrders = 0;

  totalTables = 0;

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
      activeTables: 0,
      ordersToday: 0,
      conversionRate: 0,
      totalProducts: 0,
    },
    recentOrders: [] as any[],
    alerts: [] as any[],
    activities: [] as any[],
  };

  dashboardShortcuts: ShortcutItem[] = [
    { id: 'order', icon: 'cart', iconColor: 'primary', title: 'Nuevo Pedido', description: 'Crear una transacción' },
    { id: 'product', icon: 'cube', iconColor: 'primary', title: 'Añadir producto', description: 'Listar nuevo item' },
    { id: 'family', icon: 'folder', iconColor: 'success', title: 'Nueva Familia', description: 'Categorizar productos' },
    { id: 'table', icon: 'restaurant', iconColor: 'primary', title: 'Nueva Mesa', description: 'Crear nueva mesa' }
  ];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private familyService: FamilyService,
    private zoneService: ZoneService,
    private orderService: OrderService,
    private saleService: SaleService,
    private modalController: ModalController,
    private toastController: ToastController,
    private tableService: TableService
  ) {
    addIcons({
      'cash-outline': cashOutline,
      'chevron-forward': chevronForward,
      'arrow-up': arrowUp,
      'arrow-down': arrowDown,
      'people': people,
      'cart': cart,
      'pie-chart': pieChart,
      'cube': cube,
      'arrow-forward-outline': arrowForwardOutline,
      'checkmark-circle': checkmarkCircle,
      'time': time,
      'close-circle': closeCircle,
      'flash-outline': flashOutline,
      'alert-circle': alertCircle,
      'warning': warning,
      'person': person,
      'cash': cash,
      'folder': folder,
      'receipt': receipt,
      'restaurant': restaurant,
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    // Permitir rol supervisor (o admin por flexibilidad en desarrollo)
    if (!this.currentUser || (this.currentUser.role !== 'supervisor' && this.currentUser.role !== 'admin')) {
      this.isSupervisor = false;
      this.dashboardData.alerts.push({
        type: 'danger',
        title: 'Acceso denegado',
        description: 'No tienes permisos para ver este dashboard. Requiere rol de supervisor.',
        timeAgo: 'Ahora',
      });
      this.isLoading = false;
      return;
    }

    this.isSupervisor = true;
    this.restaurantId = this.currentUser.restaurant_id;
    this.loadStatistics();
  }

  private loadStatistics(): void {
    const now = new Date();
    this.dashboardData.alerts.push({
      type: 'success',
      title: '¡Bienvenido!',
      description: `Dashboard del Restaurante #${this.restaurantId} - Gerente ${this.currentUser?.name || 'Usuario'}`,
      timeAgo: 'Hace unos momentos',
    });

    this.dashboardData.activities.push({
      type: 'login',
      icon: 'person',
      title: 'Sesión superisora iniciada',
      description: `${this.currentUser?.name} inició sesión en la gestión del restaurante #${this.restaurantId}`,
      timeAgo: 'Hace unos segundos',
    });

    this.productService.list().subscribe({
      next: (response) => {
        this.totalProducts = response.meta.total;
        this.activeProducts = response.data.filter((p: any) => p.active).length;
        this.dashboardData.metrics.totalProducts = this.totalProducts;

        this.dashboardData.activities.push({
          type: 'info',
          icon: 'cube',
          title: `${this.totalProducts} productos catalogados`,
          description: `${this.activeProducts} en oferta actual`,
          timeAgo: 'Hace segundos',
        });
      },
      error: () => {}
    });

    this.familyService.list().subscribe({
      next: (response) => {
        this.families = response.data || [];
        this.totalFamilies = response.meta.total;
        this.activeFamilies = this.families.filter((f: any) => f.active).length;
      },
      error: () => {}
    });

    this.zoneService.list().subscribe({
      next: (response) => {
        this.totalZones = response.meta.total;
      },
      error: () => {}
    });

    this.tableService.list().subscribe({
      next: (response) => {
        this.totalTables = response.meta.total;
        this.dashboardData.metrics.activeTables = this.totalTables;
      },
      error: () => {}
    });

    this.orderService.list().subscribe({
      next: (response) => {
        const userOrders = response.data || [];

        this.totalOrders = userOrders.length;
        this.openOrders = userOrders.filter((o: any) => o.status === 'open').length;

        this.dashboardData.metrics.ordersToday = this.openOrders;

        this.dashboardData.recentOrders = userOrders.slice(0, 5).map((order: any) => ({
          id: order.uuid || order.id,
          customerName: `Mesa ${order.table_id || 'N/A'}`,
          customerInitials: 'M',
          itemsCount: order.items_count || 0,
          total: order.total || 0,
          date: order.opened_at ? new Date(order.opened_at).toLocaleDateString() : 'N/A',
          status: order.status === 'open' ? 'Processing' : order.status === 'closed' ? 'Completed' : 'Cancelled',
          colorAvatar: '#6b4ec9',
        }));

      },
      error: () => {}
    });

    this.saleService.list().subscribe({
      next: (response) => {
        const restaurantSales = response.data || [];

        this.totalSales = restaurantSales.length;
        this.totalRevenue = restaurantSales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);

        this.dashboardData.revenue.total = this.totalRevenue;
        this.dashboardData.revenue.thisWeek = this.totalRevenue * 0.4;
        this.dashboardData.revenue.avgOrder = this.totalRevenue / Math.max(this.totalSales, 1);
        this.dashboardData.revenue.mrr = this.totalRevenue * 30;
        this.dashboardData.revenue.trendPercentage = 12.5;
        this.dashboardData.metrics.conversionRate = 3.5;

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  handleShortcutClick(id: string): void {
    switch(id) {
      case 'order': this.crearOrden(); break;
      case 'product': this.agregarProducto(); break;
      case 'family': this.agregarFamilia(); break;
      case 'table': this.agregarMesa(); break;
    }
  }

  crearOrden(): void {
    console.log('Crear una nueva orden desde el supervisor');
  }

  async agregarProducto(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductFormComponent,
      cssClass: 'fullscreen-modal',
      componentProps: {
        families: this.families,
        taxes: []
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.isLoading = true;
      this.productService.create(data).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Producto creado correctamente',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();

          this.dashboardData.alerts.unshift({
            type: 'success',
            title: 'Inventario actualizado',
            description: `Se ha añadido el producto "${data.name}" al catálogo.`,
            timeAgo: 'Justo ahora'
          });

          this.loadStatistics();
        },
        error: async (error) => {
          const toast = await this.toastController.create({
            message: 'Error al crear el producto: ' + (error.error?.message || 'Error desconocido'),
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
          this.isLoading = false;
        }
      });
    }
  }

  async agregarFamilia(): Promise<void> {
    const modal = await this.modalController.create({
      component: FamilyFormComponent,
      cssClass: 'fullscreen-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.isLoading = true;
      this.familyService.create(data).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Familia creada con éxito',
            duration: 2000,
            color: 'success'
          });
          await toast.present();

          this.dashboardData.alerts.unshift({
            type: 'success',
            title: 'Categoría añadida',
            description: `Nueva familia: "${data.name}"`,
            timeAgo: 'Justo ahora'
          });

          this.loadStatistics();
        },
        error: () => this.isLoading = false
      });
    }
  }

  async agregarMesa(): Promise<void> {
    const modal = await this.modalController.create({
      component: TablesFormComponent,
      cssClass: 'fullscreen-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.isLoading = true;
      this.tableService.create(data).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Mesa creada con éxito',
            duration: 2000,
            color: 'success'
          });
          await toast.present();

          this.dashboardData.alerts.unshift({
            type: 'success',
            title: 'Nueva mesa',
            description: `Mesa creada: ${data.name}`,
            timeAgo: 'Justo ahora'
          });

          this.loadStatistics();
        },
        error: () => this.isLoading = false
      });
    }
  }
}
