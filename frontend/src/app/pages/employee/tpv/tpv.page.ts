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
import { AuthService } from '@services/auth/auth.service';
import { Observable, map, of, forkJoin } from 'rxjs';

interface CartItem {
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Estados de vista
  public viewState: 'tables' | 'order' = 'tables';

  // Datos para vista de mesas
  public zones: Zone[] = [];
  public selectedZoneUuid: string | null = null;
  public tables: Table[]= [];
  public filteredTables: Table[] = [];

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
      products: this.productService.list(1, 500)
    }).subscribe({
      next: (res) => {
        this.zones = res.zones.data;
        this.tables = res.tables.data;
        this.families = res.families.data;
        this.taxes = res.taxes.data;
        this.products = res.products.data;

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

  public onTableClick(table: Table): void {
    this.selectedTable = table;
    this.viewState = 'order';
    this.cart = [];
    // Aquí se cargaría el pedido abierto si existiera
    // Por ahora simulamos que siempre empezamos un pedido nuevo
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
    if (this.cart.length === 0) return;

    // Lógica para guardar el pedido en el backend
    console.log('Enviando pedido para mesa', this.selectedTable?.name, this.cart);
    // Integrar con OrderService.create(...) cuando tengamos las líneas de pedido claras

    // Feedback visual
    alert('Pedido enviado a cocina');
    this.backToTables();
  }

  public closeTicket() {
    if (this.cart.length === 0) return;
    alert('Cerrando ticket y cobrando: ' + (this.total / 100).toFixed(2) + '€');
    this.backToTables();
  }

  public logout() {
    this.authService.logout();
    // Redirigir a login o mostrar mensaje
   this.router.navigate(['/login']);
  }
}
