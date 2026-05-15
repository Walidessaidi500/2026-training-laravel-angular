import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cashOutline, chevronForward, arrowUp, arrowDown, people, cart,
  pieChart, cube, arrowForwardOutline, checkmarkCircle, time,
  closeCircle, flashOutline, alertCircle, warning, person, cash,
  folder, receipt, restaurant
} from 'ionicons/icons';

// Facades
import { AdminDashboardFacade, DashboardData } from '@app/core/facades/admin-dashboard.facade';
import { InventoryFacade } from '@app/core/facades/inventory.facade';
import { UsersFacade } from '@app/core/facades/users.facade';

// Services
import { AuthService } from '@services/auth/auth.service';
import { TableService } from '@services/domain/table.service';
import { UiService } from '@services/ui/ui.service';

// Components
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { ProductFormComponent } from '@components/product-form/product-form.component';
import { FamilyFormComponent } from '@components/families-form/families-form.component';
import { TaxFormComponent } from '@components/tax-form/tax-form.component';
import { UserFormComponent } from '@components/user-form/user-form.component';
import { TablesFormComponent } from '@components/tables-form/tables-form.component';
import { SaleDetailModalComponent } from '@components/sale-detail-modal/sale-detail-modal.component';
import { MicroStatCardComponent } from '@components/micro-stat-card/micro-stat-card.component';
import { ShortcutListComponent, ShortcutItem } from '@components/shortcut-list/shortcut-list.component';
import { AlertListComponent } from '@components/alert-list/alert-list.component';
import { TimelineListComponent } from '@components/timeline-list/timeline-list.component';
import { Observable, firstValueFrom } from 'rxjs';

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
    UserFormComponent,
    TablesFormComponent,
    SaleDetailModalComponent,
    MicroStatCardComponent,
    ShortcutListComponent,
    AlertListComponent,
    TimelineListComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardPage implements OnInit {
  private readonly facade = inject(AdminDashboardFacade);
  private readonly inventoryFacade = inject(InventoryFacade);
  private readonly usersFacade = inject(UsersFacade);
  private readonly authService = inject(AuthService);
  private readonly tableService = inject(TableService);
  private readonly modalController = inject(ModalController);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  public readonly dashboardData$: Observable<DashboardData> = this.facade.dashboardData$;
  public readonly isLoading$: Observable<boolean> = this.facade.isLoading$;

  public currentUser: any = null;
  public isAdmin = false;
  public restaurantId: number | undefined;

  public dashboardShortcuts: ShortcutItem[] = [
    { id: 'product', icon: 'cube', iconColor: 'primary', title: 'Añadir producto', description: 'Listar nuevo item' },
    { id: 'user', icon: 'people', iconColor: 'warning', title: 'Nuevo Usuario', description: 'Dar acceso al sistema' },
    { id: 'family', icon: 'folder', iconColor: 'success', title: 'Nueva Familia', description: 'Categorizar productos' },
    { id: 'tax', icon: 'receipt', iconColor: 'primary', title: 'Nuevo Impuesto', description: 'Configurar IVA/Tasas' },
    { id: 'table', icon: 'restaurant', iconColor: 'primary', title: 'Nueva Mesa', description: 'Crear nueva mesa' }
  ];

  constructor() {
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
    this.isAdmin = this.authService.hasRole('admin');
    
    if (this.isAdmin) {
      this.restaurantId = this.currentUser?.restaurant_id;
      this.facade.loadStatistics();
    }
  }

  handleShortcutClick(id: string): void {
    switch(id) {
      case 'product': this.agregarProducto(); break;
      case 'user': this.agregarUsuario(); break;
      case 'family': this.agregarFamilia(); break;
      case 'tax': this.agregarImpuesto(); break;
      case 'table': this.agregarMesa(); break;
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  async agregarProducto(): Promise<void> {
    const families = await firstValueFrom(this.facade.getFamilies());
    const taxes = await firstValueFrom(this.facade.getTaxes());

    const modal = await this.modalController.create({
      component: ProductFormComponent,
      cssClass: 'fullscreen-modal',
      componentProps: { families, taxes }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.inventoryFacade.createProduct(data).subscribe({
        next: async (res) => {
          this.uiService.showSuccess('Producto creado correctamente');
          this.facade.addActivity({
            type: 'info',
            icon: 'cube',
            title: 'Nuevo producto',
            description: `${this.currentUser?.name} añadió "${res.name}"`,
            timeAgo: 'Justo ahora'
          });
          this.facade.loadStatistics();
        },
        error: (err) => this.uiService.showError('Error: ' + (err.error?.message || 'Operación fallida'))
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
      this.inventoryFacade.createFamily(data).subscribe({
        next: async (res) => {
          this.uiService.showSuccess('Familia creada con éxito');
          this.facade.addActivity({
            type: 'info',
            icon: 'folder',
            title: 'Nueva familia',
            description: `${this.currentUser?.name} creó "${res.name}"`,
            timeAgo: 'Justo ahora'
          });
          this.facade.loadStatistics();
        },
        error: (err) => this.uiService.showError('Error: ' + (err.error?.message || 'Operación fallida'))
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
      this.inventoryFacade.createTax(data).subscribe({
        next: async (res) => {
          this.uiService.showSuccess('Impuesto configurado');
          this.facade.loadStatistics();
        },
        error: (err) => this.uiService.showError('Error: ' + (err.error?.message || 'Operación fallida'))
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
      this.usersFacade.createUser(data).subscribe({
        next: () => {
          this.uiService.showSuccess('Usuario creado con éxito');
          this.facade.loadStatistics();
        },
        error: (err) => this.uiService.showError('Error: ' + (err.error?.message || 'Operación fallida'))
      });
    }
  }

  async agregarMesa(): Promise<void> {
    const zones = await firstValueFrom(this.facade.getZones());
    
    const modal = await this.modalController.create({
      component: TablesFormComponent,
      cssClass: 'fullscreen-modal',
      componentProps: { zones }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.tableService.create(data).subscribe({
        next: () => {
          this.uiService.showSuccess('Mesa creada con éxito');
          this.facade.loadStatistics();
        },
        error: (err) => this.uiService.showError('Error: ' + (err.error?.message || 'Operación fallida'))
      });
    }
  }

  async verDetallePedido(order: any): Promise<void> {
    if (!order.originalData) return;
    
    const products = await firstValueFrom(this.facade.getProducts());
    const dashboardData = await firstValueFrom(this.dashboardData$);

    const modal = await this.modalController.create({
      component: SaleDetailModalComponent,
      cssClass: 'sale-detail-modal',
      componentProps: { 
        sale: order.originalData,
        products: products,
        tables: dashboardData.tables,
        users: dashboardData.users
      }
    });

    await modal.present();
  }
}
