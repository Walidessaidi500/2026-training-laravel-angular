import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import {
  gridOutline,
  layersOutline,
  fastFoodOutline,
  cartOutline,
  arrowBackOutline,
  personCircleOutline,
  receiptOutline,
  checkmarkCircleOutline,
  trashOutline,
  addOutline,
  removeOutline,
  closeOutline,
  cloudUploadOutline,
  walletOutline,
  logOutOutline,
  chevronDownOutline,
  peopleOutline,
  printOutline,
  backspaceOutline,
  checkmarkCircle,
  alertCircle
} from 'ionicons/icons';

import { TableService, Table } from '@services/domain/table.service';
import { ZoneService, Zone } from '@services/domain/zone.service';
import { ProductService, Product } from '@services/domain/product.service';
import { FamilyService, Family } from '@services/domain/family.service';
import { TaxService, Tax } from '@services/domain/tax.service';
import { OrderService, Order } from '@services/domain/order.service';
import { SaleService } from '@services/domain/sale.service';
import { UserService, User } from '@services/domain/user.service';
import { AuthService } from '@services/auth/auth.service';
import { UiService } from '@app/core/services/ui/ui.service';
import { Observable, map, of, forkJoin, catchError } from 'rxjs';

interface CartItem {
  uuid?: string;
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-tpv',
  templateUrl: './tpv.page.html',
  styleUrls: ['./tpv.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, CurrencyPipe]
})
export class TpvPage implements OnInit {
  private readonly tableService = inject(TableService);
  private readonly zoneService = inject(ZoneService);
  private readonly productService = inject(ProductService);
  private readonly familyService = inject(FamilyService);
  private readonly taxService = inject(TaxService);
  private readonly orderService = inject(OrderService);
  private readonly saleService = inject(SaleService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  // Estados de vista
  public viewState: 'tables' | 'order' = 'tables';

  // Datos para vista de mesas
  public zones: Zone[] = [];
  public selectedZoneUuid: string | null = null;
  public tables: Table[]= [];
  public filteredTables: Table[] = [];
  public tableOrders: { [tableUuid: string]: boolean } = {};
  public users: User[] = [];

  // Datos para vista de pedido
  public families: Family[] = [];
  public taxes: Tax[] = [];
  public selectedFamilyUuid: string | null = null;
  public products: Product[] = [];
  public filteredProducts: Product[] = [];
  public selectedTable: Table | null = null;
  public currentOrder: Order | null = null;
  public cart: CartItem[] = [];

  // Control de Modales
  public showUserSelection = false;
  public showDinersSelection = false;
  public showPinModal = false;
  public userSelectionContext: 'opening' | 'closing' = 'opening';
  public selectedOpUser: User | null = null;
  public selectedUserForPin: User | null = null;
  public pinBuffer: string = '';
  public tempDiners: string = '1';

  public currentUser = this.authService.getUser();

  constructor() {
    addIcons({
      gridOutline,
      layersOutline,
      fastFoodOutline,
      cartOutline,
      arrowBackOutline,
      personCircleOutline,
      receiptOutline,
      checkmarkCircleOutline,
      trashOutline,
      addOutline,
      removeOutline,
      closeOutline,
      cloudUploadOutline,
      walletOutline,
      logOutOutline,
      chevronDownOutline,
      peopleOutline,
      printOutline,
      backspaceOutline,
      checkmarkCircle,
      alertCircle
    });
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    forkJoin({
      zones: this.zoneService.list(1, 100),
      tables: this.tableService.list(1, 100),
      families: this.familyService.list(true),
      taxes: this.taxService.list(),
      products: this.productService.list(1, 500, true),
      activeOrders: this.orderService.list(1, 1000),
      users: this.userService.list(1, 100).pipe(
        map(res => ({
          ...res,
          data: res.data.filter(u => u.role === 'operator' || u.role === 'supervisor')
        })),
        catchError(err => {
          console.warn('No se pudo cargar la lista de usuarios (posible falta de permisos)', err);
          return of({ data: [], meta: { current_page: 1, per_page: 100, total: 0, last_page: 1 } });
        })
      )
    }).subscribe({
      next: (res) => {
        this.zones = res.zones.data;
        this.tables = res.tables.data;
        this.families = res.families.data;
        this.taxes = res.taxes.data;
        this.products = res.products.data;
        this.users = res.users.data;

        // Si no hay usuarios cargados (falla permisos), usamos el actual como mínimo
        if (this.users.length === 0 && this.currentUser) {
          this.users = [this.currentUser as unknown as User];
        }

        this.processActiveOrders(res.activeOrders.data);

        if (this.zones.length > 0) {
          this.selectZone(this.zones[0].uuid);
        } else {
          this.filteredTables = this.tables;
        }

        if (this.families.length > 0) {
          this.selectFamily(this.families[0].uuid);
        }
      }
    });
  }

  private processActiveOrders(orders: Order[]) {
    this.tableOrders = {}; // Limpiar estado anterior
    orders.forEach(order => {
      if (order.status === 'open') {
        const table = this.tables.find(t => t.uuid === order.table_uuid);
        if (table) {
          this.tableOrders[table.uuid] = true;
        }
      }
    });
  }

  private refreshTableStatus() {
    this.orderService.list(1, 1000).subscribe({
      next: (res) => {
        this.processActiveOrders(res.data);
      }
    });
  }

  // --- Lógica de Mesas ---

  public selectZone(zoneUuid: string) {
    this.selectedZoneUuid = zoneUuid;
    this.filteredTables = this.tables.filter(t => t.zone_id === zoneUuid);
  }

  public isTableOccupied(table: Table): boolean {
    return !!this.tableOrders[table.uuid];
  }

  public onTableClick(table: Table): void {
    this.selectedTable = table;

    if (this.isTableOccupied(table)) {
      this.loadOrderForTable(table);
    } else {
      // Mesa libre -> Iniciar flujo de apertura
      this.userSelectionContext = 'opening';
      this.showUserSelection = true;
    }
  }

  private loadOrderForTable(table: Table) {
    this.viewState = 'order';
    this.cart = [];
    this.currentOrder = null;

    this.orderService.getActiveOrderByTable(table.uuid).subscribe({
      next: (order) => {
        if (order) {
          this.currentOrder = order;
          this.cart = (order.lines || []).map(line => {
            const product = this.products.find(p => p.uuid === line.product_uuid);
            return {
              uuid: line.uuid,
              product: product!,
              quantity: line.quantity
            };
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar pedido activo', err);
      }
    });
  }

  public selectUser(user: User) {
    this.selectedUserForPin = user;
    this.pinBuffer = '';
    this.showUserSelection = false;
    this.showPinModal = true;
  }

  public addPinDigit(digit: string) {
    if (this.pinBuffer.length < 10) {
      this.pinBuffer += digit;
    }
  }

  public removePinDigit() {
    if (this.pinBuffer.length > 0) {
      this.pinBuffer = this.pinBuffer.slice(0, -1);
    }
  }

  public onPinConfirm() {
    if (!this.selectedUserForPin) return;

    // Si el usuario no tiene PIN configurado, o si el PIN coincide
    const userPin = this.selectedUserForPin.pin || '';
    
    if (userPin === this.pinBuffer) {
      this.showPinModal = false;
      const user = this.selectedUserForPin;
      this.selectedUserForPin = null;
      this.pinBuffer = '';

      if (this.userSelectionContext === 'opening') {
        this.selectedOpUser = user;
        this.tempDiners = '1';
        this.showDinersSelection = true;
      } else {
        // closing
        this.processClosing(user);
      }
    } else {
      this.uiService.showError('PIN incorrecto');
      this.pinBuffer = '';
    }
  }

  public onDinersConfirm() {
    let dinersCount = parseInt(this.tempDiners);
    if (isNaN(dinersCount) || dinersCount < 1) {
      dinersCount = 1;
    }

    this.showDinersSelection = false;
    if (this.currentOrder) {
      // Estamos editando comensales de un pedido abierto
      this.currentOrder.diners = parseInt(this.tempDiners) || 1;
      this.sendOrder(); // Sincronizar el cambio
    } else {
      // Es una apertura nueva
      this.viewState = 'order';
      this.cart = [];
      this.tempDiners = dinersCount.toString();
    }
  }

  public addDinerDigit(digit: string) {
    if (this.tempDiners === '0') {
      this.tempDiners = digit;
    } else {
      this.tempDiners += digit;
    }
  }

  public removeDinerDigit() {
    if (this.tempDiners.length > 1) {
    this.tempDiners = this.tempDiners.slice(0, -1);
    } else {
      // Si borran el último dígito, lo dejamos en '0' para que el siguiente click lo reemplace.
      // Al confirmar, onDinersConfirm ya se encargará de pasarlo a 1 si lo dejan en 0.
      this.tempDiners = '0';
    }
  }

  public editDiners() {
    this.tempDiners = (this.currentOrder?.diners || 1).toString();
    this.showDinersSelection = true;
  }

  public backToTables() {
    this.viewState = 'tables';
    this.selectedTable = null;
    this.currentOrder = null;
    this.cart = [];
    this.selectedOpUser = null;
    this.refreshTableStatus(); // Refrescar estado al volver
  }

  // --- Lógica de Pedido ---

  public selectFamily(familyUuid: string) {
    this.selectedFamilyUuid = familyUuid;
    this.updateFilteredProducts();
  }

  private updateFilteredProducts() {
    if (!this.selectedFamilyUuid) return;
    this.filteredProducts = this.products.filter(p => 
      p.family_id === this.selectedFamilyUuid && 
      p.active && 
      p.stock > 0 && 
      p.tax_id
    );
  }

  /**
   * Calcula el precio de un producto aplicando su IVA correspondiente
   */
  public getPriceWithTax(product: Product): number {
    const tax = this.taxes.find(t => t.uuid === product.tax_id);
    const percentage = tax ? tax.percentage : 0;
    return product.priceInCents * (1 + percentage / 100);
  }

  public addToCart(product: Product) {
    const existingItem = this.cart.find(item => item.product.uuid === product.uuid);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      this.uiService.showError(`No queda más stock de ${product.name}`);
      return;
    }

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  public removeFromCart(index: number) {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity--;
    } else {
      this.cart.splice(index, 1);
    }
  }

  public clearCart() {
    this.cart = [];
  }

  public get total(): number {
    return this.cart.reduce((sum, item) => sum + (this.getPriceWithTax(item.product) * item.quantity), 0);
  }

  public sendOrder() {
    if (!this.selectedTable) return;

    const orderData = {
      table_uuid: this.selectedTable.uuid,
      diners: this.currentOrder?.diners || parseInt(this.tempDiners) || 1,
      opened_by_user_uuid: this.currentOrder?.opened_by_user_uuid || this.selectedOpUser?.uuid || this.currentUser?.uuid,
      lines: this.cart.map(item => {
        const tax = this.taxes.find(t => t.uuid === item.product.tax_id);
        return {
          uuid: item.uuid,
          product_uuid: item.product.uuid,
          quantity: item.quantity,
          price: item.product.priceInCents,
          tax_percentage: tax ? tax.percentage : 0
        };
      })
    };

    this.orderService.sync(orderData).subscribe({
      next: (res: any) => {
        // Al sincronizar, si es nuevo se crea el currentOrder con su UUID
        if (!this.currentOrder) {
          this.currentOrder = res;
        }
        this.uiService.showSuccess('Pedido mandado a cocina correctamente');
        this.refreshProducts(); // Refrescar stock tras enviar pedido
      },
      error: (err) => {
        console.error('Error al mandar el pedido', err);
        this.uiService.showError('Error al enviar a cocina');
      }
    });
  }

  private refreshProducts() {
    this.productService.list(1, 500, true).subscribe({
      next: (res) => {
        this.products = res.data;
        this.updateFilteredProducts();
        
        // Actualizar referencias en el carrito para reflejar stock actualizado
        this.cart.forEach(item => {
          const updatedProduct = this.products.find(p => p.uuid === item.product.uuid);
          if (updatedProduct) {
            item.product = updatedProduct;
          }
        });
      }
    });
  }

  public printProvisional() {
    this.uiService.showSuccess('Imprimiendo ticket provisional...');
    // Aquí se llamaría a un servicio de impresión o endpoint de backend si existiera
  }

  public closeTicket() {
    if (this.cart.length === 0 || !this.selectedTable) return;
    this.userSelectionContext = 'closing';
    this.showUserSelection = true;
  }

  private processClosing(user: User) {
    if (!this.selectedTable) return;

    const saleData = {
      table_uuid: this.selectedTable.uuid,
      user_uuid: user.uuid, // Usuario que cierra
      diners: this.currentOrder?.diners || 1,
      lines: this.cart.map(item => {
        const tax = this.taxes.find(t => t.uuid === item.product.tax_id);
        return {
          product_uuid: item.product.uuid,
          quantity: item.quantity,
          price: item.product.priceInCents,
          tax_percentage: tax ? tax.percentage : 0
        };
      })
    };

    this.saleService.process(saleData).subscribe({
      next: () => {
        this.uiService.showSuccess('Ticket cerrado y cobrado correctamente');
        this.refreshProducts(); // Importante refrescar stock al cobrar
        this.backToTables();
      },
      error: (err) => {
        console.error('Error al procesar la venta', err);
        this.uiService.showError('Hubo un error al procesar la venta');
      }
    });
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
