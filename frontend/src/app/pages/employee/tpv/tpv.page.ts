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
  chevronDownOutline
} from 'ionicons/icons';

import { TableService, Table } from '@services/domain/table.service';
import { ZoneService, Zone } from '@services/domain/zone.service';
import { ProductService, Product } from '@services/domain/product.service';
import { FamilyService, Family } from '@services/domain/family.service';
import { TaxService, Tax } from '@services/domain/tax.service';
import { OrderService, Order } from '@services/domain/order.service';
import { SaleService } from '@services/domain/sale.service';
import { AuthService } from '@services/auth/auth.service';
import { Observable, map, of, forkJoin } from 'rxjs';

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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Estados de vista
  public viewState: 'tables' | 'order' = 'tables';

  // Datos para vista de mesas
  public zones: Zone[] = [];
  public selectedZoneUuid: string | null = null;
  public tables: Table[]= [];
  public filteredTables: Table[] = [];
  public tableOrders: { [tableUuid: string]: boolean } = {};

  // Datos para vista de pedido
  public families: Family[] = [];
  public taxes: Tax[] = [];
  public selectedFamilyUuid: string | null = null;
  public products: Product[] = [];
  public filteredProducts: Product[] = [];
  public selectedTable: Table | null = null;
  public currentOrder: Order | null = null;
  public cart: CartItem[] = [];

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
      chevronDownOutline

    });
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    forkJoin({
      zones: this.zoneService.list(1, 100),
      tables: this.tableService.list(1, 100),
      families: this.familyService.list(),
      taxes: this.taxService.list(),
      products: this.productService.list(1, 500),
      activeOrders: this.orderService.list(1, 1000)
    }).subscribe({
      next: (res) => {
        this.zones = res.zones.data;
        this.tables = res.tables.data;
        this.families = res.families.data;
        this.taxes = res.taxes.data;
        this.products = res.products.data;

        // Map active orders to tables
        res.activeOrders.data.forEach(order => {
          if (order.status === 'open') {
            const table = this.tables.find(t => t.id === order.table_id);
            if (table) {
              this.tableOrders[table.uuid] = true;
            }
          }
        });

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
    this.viewState = 'order';
    this.cart = [];
    this.currentOrder = null;

    this.orderService.getActiveOrderByTable(table.uuid).subscribe({
      next: (order) => {
        if (order) {
          this.currentOrder = order;
          this.cart = (order.order_lines || []).map(line => {
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

  public backToTables() {
    this.viewState = 'tables';
    this.selectedTable = null;
    this.currentOrder = null;
    this.cart = [];
  }

  // --- Lógica de Pedido ---

  public selectFamily(familyUuid: string) {
    this.selectedFamilyUuid = familyUuid;
    this.filteredProducts = this.products.filter(p => p.family_id === familyUuid);
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
    if (this.cart.length === 0 || !this.selectedTable) return;

    const orderData = {
      table_uuid: this.selectedTable.uuid,
      diners: this.currentOrder?.diners || 1,
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
      next: () => {
        alert('Comanda guardada y enviada a cocina');
        this.backToTables();
      },
      error: (err) => {
        console.error('Error al sincronizar el pedido', err);
        alert('Error al enviar a cocina');
      }
    });
  }

  public closeTicket() {
    if (this.cart.length === 0 || !this.selectedTable) return;

    const saleData = {
      table_uuid: this.selectedTable.uuid,
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
        alert('Ticket cerrado y cobrado correctamente');
        this.backToTables();
      },
      error: (err) => {
        console.error('Error al procesar la venta', err);
        alert('Hubo un error al procesar la venta');
      }
    });
  }

  public logout() {
    this.authService.logout();
    // Redirigir a login o mostrar mensaje
   this.router.navigate(['/login']);
  }
}
