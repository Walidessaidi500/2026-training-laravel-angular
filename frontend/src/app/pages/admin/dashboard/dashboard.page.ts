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
  receipt
} from 'ionicons/icons';
import { AuthService } from '@services/auth/auth.service';
import { ProductService } from '@services/domain/product.service';
import { FamilyService } from '@services/domain/family.service';
import { TaxService } from '@services/domain/tax.service';
import { ZoneService } from '@services/domain/zone.service';
import { OrderService } from '@services/domain/order.service';
import { UserService } from '@services/domain/user.service';
import { SaleService } from '@services/domain/sale.service';
import { AccessDeniedComponent } from '@app/components/access-denied/access-denied.component';
import { ProductFormComponent } from '@app/components/product-form/product-form.component';
import { FamilyFormComponent } from '@app/components/families-form/families-form.component';
import { TaxFormComponent } from '@app/components/tax-form/tax-form.component';
import { UserFormComponent } from '@app/components/user-form/user-form.component';

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
    TaxFormComponent,
    UserFormComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardPage implements OnInit {
  // Usuario autenticado
  currentUser: User | null = null;
  isAdmin = false;
  restaurantId: number | undefined;

  // Datos para formularios
  families: any[] = [];
  taxes: any[] = [];

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
    private authService: AuthService,
    private productService: ProductService,
    private familyService: FamilyService,
    private taxService: TaxService,
    private zoneService: ZoneService,
    private orderService: OrderService,
    private userService: UserService,
    private saleService: SaleService,
    private modalController: ModalController,
    private toastController: ToastController
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
      'receipt': receipt
    });
  }

  ngOnInit(): void {
    // Obtener usuario actual
    this.currentUser = this.authService.getUser();

    // Verificar si el usuario es admin
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.isAdmin = false;
      this.dashboardData.alerts.push({
        type: 'danger',
        title: 'Acceso denegado',
        description: 'No tienes permisos para ver este dashboard. Requiere rol de administrador.',
        timeAgo: 'Ahora',
      });
      this.isLoading = false;
      return;
    }

    this.isAdmin = true;
    this.restaurantId = this.currentUser.restaurant_id;
    this.loadStatistics();
  }

  private loadStatistics(): void {
    // Agregar alerta de bienvenida con información del restaurante
    const now = new Date();
    this.dashboardData.alerts.push({
      type: 'success',
      title: '¡Bienvenido!',
      description: `Dashboard del Restaurante #${this.restaurantId} - ${this.currentUser?.name || 'Usuario'}`,
      timeAgo: 'Hace unos momentos',
    });

    // Agregar actividad inicial
    this.dashboardData.activities.push({
      type: 'login',
      icon: 'person',
      title: 'Sesión iniciada',
      description: `${this.currentUser?.name} inició sesión como administrador del restaurante #${this.restaurantId}`,
      timeAgo: 'Hace unos segundos',
    });

    // Cargar productos del restaurante
    this.productService.list().subscribe({
      next: (response) => {
        // El backend filtra automáticamente por restaurant_id del usuario autenticado
        this.totalProducts = response.meta.total;
        this.activeProducts = response.data.filter((p) => p.active).length;
        this.dashboardData.metrics.totalProducts = this.totalProducts;

        this.dashboardData.activities.push({
          type: 'info',
          icon: 'cube',
          title: `${this.totalProducts} productos en el restaurante`,
          description: `${this.activeProducts} productos activos`,
          timeAgo: 'Hace segundos',
        });
      },
      error: (error) => {
        console.error('Error cargando los productos:', error);
        this.dashboardData.alerts.push({
          type: 'danger',
          title: 'Error al cargar productos',
          description: error?.message || 'No se pudieron cargar los datos de productos de tu restaurante',
          timeAgo: 'Hace unos momentos',
        });
      },
    });

    // Cargar familias del restaurante
    this.familyService.list().subscribe({
      next: (response) => {
        this.families = response.data || [];
        this.totalFamilies = response.meta.total;
        this.activeFamilies = this.families.filter((f) => f.active).length;
      },
      error: (error) => console.error('Error cargando las familias:', error),
    });

    // Cargar impuestos del restaurante
    this.taxService.list().subscribe({
      next: (response) => {
        this.taxes = response.data || [];
        this.totalTaxes = response.meta.total;
      },
      error: (error) => console.error('Error cargando los impuestos:', error),
    });

    // Cargar zonas del restaurante
    this.zoneService.list().subscribe({
      next: (response) => {
        // El backend filtra automáticamente por restaurant_id del usuario autenticado
        this.totalZones = response.meta.total;
      },
      error: (error) => console.error('Error cargando las zonas:', error),
    });

    // Cargar órdenes del restaurante del usuario actual
    this.orderService.list().subscribe({
      next: (response) => {
        // El backend filtra automáticamente por restaurant_id del usuario autenticado
        const userOrders = response.data || [];

        this.totalOrders = userOrders.length;
        this.openOrders = userOrders.filter((o: any) => o.status === 'open').length;

        this.dashboardData.metrics.ordersToday = this.openOrders;

        // Mapear órdenes a formato esperado
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

        this.dashboardData.activities.push({
          type: 'info',
          icon: 'cart',
          title: `${this.totalOrders} órdenes en tu restaurante`,
          description: `${this.openOrders} órdenes abiertas`,
          timeAgo: 'Hace segundos',
        });
      },
      error: (error) => {
        console.error('Error cargando los pedidos:', error);
        this.dashboardData.alerts.push({
          type: 'danger',
          title: 'Error al cargar órdenes',
          description: error?.message || 'No se pudieron cargar las órdenes de tu restaurante',
          timeAgo: 'Hace unos momentos',
        });
      },
    });

    // Cargar usuarios del restaurante
    this.userService.list().subscribe({
      next: (response) => {
        // El backend filtra automáticamente por restaurant_id del usuario autenticado
        const restaurantUsers = response.data || [];

        this.totalUsers = restaurantUsers.length;
        this.dashboardData.metrics.activeUsers = this.totalUsers;

        this.dashboardData.activities.push({
          type: 'info',
          icon: 'people',
          title: `${this.totalUsers} usuarios activos`,
          description: `Usuarios en tu restaurante`,
          timeAgo: 'Hace segundos',
        });
      },
      error: (error) => {
        console.error('Error cargando los usuarios:', error);
        this.dashboardData.alerts.push({
          type: 'danger',
          title: 'Error al cargar usuarios',
          description: error?.message || 'No se pudieron cargar los usuarios de tu restaurante',
          timeAgo: 'Hace unos momentos',
        });
      },
    });

    // Cargar ventas del restaurante
    this.saleService.list().subscribe({
      next: (response) => {
        // El backend filtra automáticamente por restaurant_id del usuario autenticado
        const restaurantSales = response.data || [];

        this.totalSales = restaurantSales.length;
        this.totalRevenue = restaurantSales.reduce((sum, sale: any) => sum + (sale.total || 0), 0);

        this.dashboardData.revenue.total = this.totalRevenue;
        this.dashboardData.revenue.thisWeek = this.totalRevenue * 0.4; // Aproximado
        this.dashboardData.revenue.avgOrder = this.totalRevenue / Math.max(this.totalSales, 1);
        this.dashboardData.revenue.mrr = this.totalRevenue * 30; // Proyección mensual básica
        this.dashboardData.revenue.trendPercentage = 12.5;
        this.dashboardData.metrics.conversionRate = 3.5;

        this.dashboardData.activities.push({
          type: 'success',
          icon: 'cash',
          title: `Ingresos del restaurante: ${this.dashboardData.revenue.total.toFixed(2)}€`,
          description: `${this.totalSales} ventas registradas en tu restaurante`,
          timeAgo: 'Hace segundos',
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando las ventas:', error);
        this.dashboardData.alerts.push({
          type: 'danger',
          title: 'Error al cargar ventas',
          description: error?.message || 'No se pudieron cargar los datos de ventas de tu restaurante',
          timeAgo: 'Hace unos momentos',
        });
        this.isLoading = false;
      },
    });
  }

  crearOrden(): void {
    console.log('Crear una nueva orden');
    // TODO: Implementar navegación a crear orden
  }

  async agregarProducto(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductFormComponent,
      cssClass: 'fullscreen-modal',
      componentProps: {
        families: this.families,
        taxes: this.taxes
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.isLoading = true;
      // Guardar producto
      this.productService.create(data).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Producto creado correctamente',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
          
          // Añadir alerta y actividad
          this.dashboardData.alerts.unshift({
            type: 'success',
            title: 'Inventario actualizado',
            description: `Se ha añadido el producto "${data.name}" al catálogo.`,
            timeAgo: 'Justo ahora'
          });
          
          this.dashboardData.activities.unshift({
            type: 'info',
            icon: 'cube',
            title: 'Nuevo producto',
            description: `${this.currentUser?.name} añadió "${data.name}"`,
            timeAgo: 'Justo ahora'
          });

          this.loadStatistics(); // Recargar estadísticas
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
          
          this.dashboardData.activities.unshift({
            type: 'info',
            icon: 'folder',
            title: 'Nueva familia',
            description: `${this.currentUser?.name} creó "${data.name}"`,
            timeAgo: 'Justo ahora'
          });

          this.loadStatistics();
        },
        error: () => this.isLoading = false
      });
    }
  }

  async agregarImpuesto(): Promise<void> {
    const modal = await this.modalController.create({
      component: TaxFormComponent,
      cssClass: 'fullscreen-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.isLoading = true;
      this.taxService.create(data).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Impuesto creado con éxito',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          
          this.dashboardData.alerts.unshift({
            type: 'success',
            title: 'Impuesto configurado',
            description: `Añadido: ${data.name} (${data.rate}%)`,
            timeAgo: 'Justo ahora'
          });
          
          this.dashboardData.activities.unshift({
            type: 'info',
            icon: 'receipt',
            title: 'Nuevo impuesto',
            description: `${this.currentUser?.name} configuró "${data.name}"`,
            timeAgo: 'Justo ahora'
          });

          this.loadStatistics();
        },
        error: () => this.isLoading = false
      });
    }
  }

  async agregarUsuario(): Promise<void> {
    const modal = await this.modalController.create({
      component: UserFormComponent,
      cssClass: 'fullscreen-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.isLoading = true;
      this.userService.create(data).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Usuario creado con éxito',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          
          this.dashboardData.alerts.unshift({
            type: 'success',
            title: 'Nuevo acceso',
            description: `Usuario creado: ${data.name}`,
            timeAgo: 'Justo ahora'
          });
          
          this.dashboardData.activities.unshift({
            type: 'info',
            icon: 'people',
            title: 'Nuevo compañero',
            description: `${this.currentUser?.name} registró a ${data.name}`,
            timeAgo: 'Justo ahora'
          });

          this.loadStatistics();
        },
        error: () => this.isLoading = false
      });
    }
  }
}
