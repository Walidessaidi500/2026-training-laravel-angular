import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import {
  gridOutline, layersOutline, fastFoodOutline, cartOutline, arrowBackOutline,
  personCircleOutline, receiptOutline, checkmarkCircleOutline, trashOutline,
  addOutline, removeOutline, closeOutline, cloudUploadOutline, walletOutline,
  logOutOutline, chevronDownOutline, peopleOutline, printOutline, backspaceOutline,
  checkmarkCircle, alertCircle, cashOutline, cardOutline, checkboxOutline, squareOutline
} from 'ionicons/icons';

import { Table } from '@services/domain/table.service';
import { Product } from '@services/domain/product.service';
import { User } from '@services/domain/user.service';
import { AuthService } from '@services/auth/auth.service';
import { UiService } from '@app/core/services/ui/ui.service';
import { SaleService } from '@services/domain/sale.service';
import { Order } from '@services/domain/order.service';
import { PrintService, PrintData } from '@app/core/services/helper/print.service';

import { TpvStateService } from './services/tpv-state.service';
import { CartService } from './services/cart.service';

import { TpvHeaderComponent } from './components/tpv-header/tpv-header.component';
import { TpvTableSelectionComponent } from './components/tpv-table-selection/tpv-table-selection.component';
import { TpvOrderManagementComponent } from './components/tpv-order-management/tpv-order-management.component';
import { TpvCartComponent } from './components/tpv-cart/tpv-cart.component';
import { TpvUserSelectionModalComponent } from './components/tpv-user-selection-modal/tpv-user-selection-modal.component';
import { TpvPinModalComponent } from './components/tpv-pin-modal/tpv-pin-modal.component';
import { TpvDinersModalComponent } from './components/tpv-diners-modal/tpv-diners-modal.component';
import { TpvPaymentModalComponent } from './components/tpv-payment-modal/tpv-payment-modal.component';

@Component({
  selector: 'app-tpv',
  templateUrl: './tpv.page.html',
  styleUrls: ['./tpv.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, FormsModule, CurrencyPipe,
    TpvHeaderComponent, TpvTableSelectionComponent, TpvOrderManagementComponent,
    TpvCartComponent, TpvUserSelectionModalComponent, TpvPinModalComponent,
    TpvDinersModalComponent, TpvPaymentModalComponent
  ]
})
export class TpvPage implements OnInit, OnDestroy {
  public readonly stateService = inject(TpvStateService);
  public readonly cartService = inject(CartService);
  public readonly uiService = inject(UiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly saleService = inject(SaleService);
  private readonly printService = inject(PrintService);
  private readonly actionSheetCtrl = inject(ActionSheetController);

  // Estado local para el manejo de datos
  public paymentType: 'total' | 'split' = 'total';
  public paymentMethod: 'cash' | 'card' | 'mixed' = 'cash';
  public amountCash: number = 0;
  public amountCard: number = 0;
  public amountGiven: number = 0;
  public paymentUser: User | null = null;

  public get changeAmount(): number {
    return this.amountGiven - this.amountCash;
  }

  public currentUser = this.authService.getUser();

  public isProcessingPayment = false;

  constructor() {
    addIcons({
      gridOutline, layersOutline, fastFoodOutline, cartOutline, arrowBackOutline,
      personCircleOutline, receiptOutline, checkmarkCircleOutline, trashOutline,
      addOutline, removeOutline, closeOutline, cloudUploadOutline, walletOutline,
      logOutOutline, chevronDownOutline, peopleOutline, printOutline, backspaceOutline,
      checkmarkCircle, alertCircle, cashOutline, cardOutline, checkboxOutline, squareOutline
    });
  }

  ngOnInit() {
    this.stateService.loadInitialData().subscribe(res => {
      this.cartService.setTaxes(res.taxes.data);
    });

    // Iniciar refresco automático de mesas cada 5 segundos
    this.stateService.startPolling(5000);
  }

  ngOnDestroy() {
    this.stateService.stopPolling();
  }

  // Acciones sobre las mesas

  public onTableClick(table: Table) {
    const effectiveTable = table.joined_to_uuid 
      ? this.stateService.state.tables.find(t => t.uuid === table.joined_to_uuid) || table
      : table;

    this.stateService.setSelectedTable(effectiveTable);

    if (this.stateService.state.tableOrders[effectiveTable.uuid]) {
      this.cartService.loadOrderForTable(effectiveTable.uuid, this.stateService.state.products)
        .subscribe(() => this.stateService.setViewState('order'));
    } else {
      this.stateService.setShowUserSelection(true, 'opening');
    }
  }

  public async onTableLongPress(table: Table) {
    const joinedTables = this.stateService.state.tables.filter(t => t.joined_to_uuid === table.uuid);
    const buttons: any[] = [
      {
        text: 'Juntar con otra mesa',
        icon: 'add-outline',
        handler: () => {
          setTimeout(() => this.showJoinTableSelection(table), 100);
        }
      }
    ];

    if (joinedTables.length > 0) {
      buttons.push({
        text: 'Separar mesas vinculadas',
        icon: 'close-outline',
        role: 'destructive',
        handler: () => this.stateService.confirmUnjoin(table, joinedTables)
      });
    }

    if (table.joined_to_uuid) {
      buttons.push({
        text: 'Separar de mesa principal',
        icon: 'close-outline',
        role: 'destructive',
        handler: () => this.stateService.confirmUnjoin(table, [])
      });
    }

    buttons.push({ text: 'Cancelar', role: 'cancel' });

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Mesa ${table.name}`,
      buttons
    });
    await actionSheet.present();
  }

  private async showJoinTableSelection(masterTable: Table) {
    const availableTables = this.stateService.state.tables.filter(t => 
      t.uuid !== masterTable.uuid && !t.joined_to_uuid && 
      !this.stateService.state.tableOrders[t.uuid] &&
      t.zone_id === masterTable.zone_id
    );

    if (availableTables.length === 0) {
      this.uiService.showError('No hay mesas libres en esta zona para juntar');
      return;
    }

    const buttons = availableTables.map(t => ({
      text: `Mesa ${t.name}`,
      handler: () => this.stateService.confirmJoin(t, masterTable)
    }));

    buttons.push({ text: 'Cancelar', role: 'cancel' } as any);

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona mesa para juntar',
      buttons
    });
    await actionSheet.present();
  }

  public backToTables() {
    this.stateService.setViewState('tables');
    this.stateService.setSelectedTable(null);
    this.cartService.clearCart();
    this.stateService.setSelectedOpUser(null);
    this.stateService.refreshTableStatus();
  }

  // Acciones sobre usuarios y apertura/cierre de mesa

  public selectUser(user: User) {
    this.stateService.setShowUserSelection(false);
    this.stateService.setShowPinModal(true, user);
  }

  public onPinConfirm() {
    const selectedUser = this.stateService.state.selectedUserForPin;
    const pinEntered = this.stateService.state.pinBuffer;
    if (!selectedUser) return;

    if ((selectedUser.pin || '') === pinEntered) {
      this.stateService.setShowPinModal(false);

      if (this.stateService.state.userSelectionContext === 'opening') {
        this.stateService.setSelectedOpUser(selectedUser);
        this.cartService.setTempDiners('1');
        this.stateService.setShowDinersSelection(true);
      } else {
        this.processClosing(selectedUser);
      }
    } else {
      this.uiService.showError('PIN incorrecto');
      this.stateService.resetPinBuffer();
    }
  }

  // Acciones sobre comanda y comensales

  public onDinersConfirm() {
    const dinersCount = parseInt(this.cartService.tempDinersValue) || 1;
    this.stateService.setShowDinersSelection(false);
    
    if (this.cartService.currentOrderValue) {
      this.cartService.currentOrderValue.diners = dinersCount;
      this.sendOrder();
    } else {
      this.stateService.setViewState('order');
      this.cartService.clearCart();
      this.cartService.setTempDiners(dinersCount.toString());
    }
  }

  // Acciones sobre el carrito

  public sendOrder() {
    const table = this.stateService.state.selectedTable;
    if (!table) return;

    const openedByUserUuid = this.stateService.state.selectedOpUser?.uuid || this.currentUser?.uuid;
    this.cartService.syncOrder(table.uuid, openedByUserUuid).subscribe({
      next: () => {
        this.uiService.showSuccess('Pedido mandado a cocina');
        this.stateService.loadInitialData().subscribe(); 
      },
      error: () => this.uiService.showError('Error al enviar a cocina')
    });
  }

  public closeTicket() {
    if (this.cartService.cartValue.length === 0 || !this.stateService.state.selectedTable) return;
    this.stateService.setShowUserSelection(true, 'closing');
  }

  private processClosing(user: User) {
    this.paymentUser = user;
    this.paymentType = 'total';
    this.paymentMethod = 'cash';
    this.amountCash = this.cartService.getTotal() / 100;
    this.amountCard = 0;
    this.amountGiven = this.amountCash;
    this.stateService.setShowPaymentModal(true);
  }

  // Acciones sobre el cobro

  public setPaymentType(type: 'total' | 'split') {
    this.paymentType = type;
    this.resetPaymentSelections();
  }

  private resetPaymentSelections() {
    const amountToPay = this.cartService.getSelectedTotal(this.paymentType) / 100;
    this.paymentMethod = 'cash';
    this.amountCash = amountToPay;
    this.amountCard = 0;
    this.amountGiven = amountToPay;
    
    if (this.paymentType === 'total') {
      this.cartService.cartValue.forEach(i => { i.selected = false; i.selectedQuantity = 0; });
    }
  }

  public setPaymentMethod(method: 'cash' | 'card' | 'mixed') {
    this.paymentMethod = method;
    const amountToPay = this.cartService.getSelectedTotal(this.paymentType) / 100;
    if (method === 'cash') {
      this.amountCash = amountToPay;
      this.amountCard = 0;
      this.amountGiven = amountToPay;
    } else if (method === 'card') {
      this.amountCash = 0;
      this.amountCard = amountToPay;
      this.amountGiven = 0;
    } else if (method === 'mixed') {
      if (this.amountCash + this.amountCard !== amountToPay) {
        this.amountCash = amountToPay;
        this.amountCard = 0;
        this.amountGiven = amountToPay;
      }
    }
  }

  public onSelectionChange() {
    const amountToPay = this.cartService.getSelectedTotal(this.paymentType) / 100;
    if (this.paymentMethod === 'cash') {
      this.amountCash = amountToPay;
      this.amountGiven = amountToPay;
      this.amountCard = 0;
    } else if (this.paymentMethod === 'card') {
      this.amountCard = amountToPay;
      this.amountCash = 0;
      this.amountGiven = 0;
    } else if (this.paymentMethod === 'mixed') {
      if (this.amountCash > amountToPay) {
        this.amountCash = amountToPay;
      }
      this.amountCard = Number((amountToPay - this.amountCash).toFixed(2));
      if (this.amountGiven < this.amountCash) {
        this.amountGiven = this.amountCash;
      }
    }
  }

  public onAmountChange() {
    const amountToPay = this.cartService.getSelectedTotal(this.paymentType) / 100;
    const cashValue = Number(this.amountCash);
    
    if (this.paymentMethod === 'mixed') {
      if (cashValue > amountToPay) {
        this.amountCash = amountToPay;
      } else {
        this.amountCash = cashValue;
      }
      this.amountCard = Number((amountToPay - this.amountCash).toFixed(2));
      if (this.amountGiven < this.amountCash) {
        this.amountGiven = this.amountCash;
      }
    }
  }

  public confirmPayment() {
    if (this.isProcessingPayment) return;

    const table = this.stateService.state.selectedTable;
    if (!table || !this.paymentUser) return;

    const cashValue = Number(this.amountCash);
    const givenValue = Number(this.amountGiven);

    if ((this.paymentMethod === 'cash' || this.paymentMethod === 'mixed') && givenValue < cashValue) {
      this.uiService.showError('Importe insuficiente');
      return;
    }

    this.isProcessingPayment = true;

    this.cartService.syncOrder(table.uuid, this.paymentUser.uuid).subscribe({
      next: (order) => {
        this.processActualPayment(order);
      },
      error: () => {
        this.isProcessingPayment = false;
        this.uiService.showError('Error al sincronizar antes de cobrar');
      }
    });
  }

  private processActualPayment(order: Order) {
    let linesToSell: any[] = [];
    const cart = this.cartService.cartValue;

    if (this.paymentType === 'total') {
      linesToSell = cart.map(item => ({
        uuid: item.uuid,
        product_uuid: item.product.uuid,
        quantity: item.quantity,
        price: item.product.priceInCents,
        tax_percentage: this.stateService.state.taxes.find(t => t.uuid === item.product.tax_id)?.percentage || 0
      }));
    } else {
      linesToSell = cart.filter(item => item.selected && (item.selectedQuantity || 0) > 0)
        .map(item => ({
          uuid: item.uuid,
          product_uuid: item.product.uuid,
          quantity: item.selectedQuantity,
          price: item.product.priceInCents,
          tax_percentage: this.stateService.state.taxes.find(t => t.uuid === item.product.tax_id)?.percentage || 0
        }));
    }

    if (linesToSell.length === 0) {
      this.isProcessingPayment = false;
      this.uiService.showError('No hay artículos seleccionados');
      return;
    }

    const saleData = {
      table_uuid: this.stateService.state.selectedTable!.uuid,
      user_uuid: this.paymentUser!.uuid,
      diners: order.diners,
      payment_method: this.paymentMethod,
      amount_cash: Math.round(this.amountCash * 100),
      amount_card: Math.round(this.amountCard * 100),
      lines: linesToSell
    };

    this.saleService.process(saleData).subscribe({
      next: (saleResponse) => {
        this.isProcessingPayment = false;
        this.uiService.showSuccess('Pago procesado');

        // Imprimir ticket
        this.printSaleTicket(saleResponse, linesToSell);
        
        // Recargar estado para reflejar cambios en mesas, órdenes y productos
        this.stateService.loadInitialData().subscribe();
        
        const isPayingTotal = this.paymentType === 'total' || 
          this.cartService.getSelectedTotal('split') === this.cartService.getTotal();

        if (isPayingTotal) {
          this.stateService.setShowPaymentModal(false);
          this.backToTables();
        } else {
          /**
           * Comprobar si quedan articulos por cobrar en la orden
           * en caso de que no, cerrar la comanda y volver a la vista de las 
           * mesas
           */
          this.cartService.loadOrderForTable(saleData.table_uuid, this.stateService.state.products).subscribe(remainingOrder => {
            if (!remainingOrder || !remainingOrder.lines || remainingOrder.lines.length === 0) {
              this.stateService.setShowPaymentModal(false);
              this.backToTables();
            } else {
              this.resetPaymentSelections();
            }
          });
        }
      },
      error: () => {
        this.isProcessingPayment = false;
        this.uiService.showError('Error al procesar la venta');
      }
    });
  }

  public printProvisional() {
    const cart = this.cartService.cartValue;
    if (cart.length === 0) {
      this.uiService.showError('El carrito está vacío');
      return;
    }

    const restaurant = this.stateService.state.restaurant;
    const restaurantName = restaurant ? (restaurant.legal_name || restaurant.name) : 'Mi Restaurante';
    const now = new Date();
    const totalCents = this.cartService.getTotal();

    const printData: PrintData = {
      restaurantName: restaurantName,
      ticketNumber: 'PRE-CUENTA PROVISIONAL',
      date: now.toLocaleDateString(),
      hour: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: cart.map(item => ({
        quantity: item.quantity,
        concept: item.product.name,
        price: item.product.priceInCents / 100,
        total: (item.product.priceInCents * item.quantity) / 100
      })),
      ivaPercentage: cart.length > 0 ? (this.stateService.state.taxes.find(t => t.uuid === cart[0].product.tax_id)?.percentage || 0) : 0,
      baseImponible: 0,
      ivaAmount: 0,
      total: totalCents / 100
    };

    // Cálculo simplificado de base e IVA para el ticket
    const ivaFact = 1 + (printData.ivaPercentage / 100);
    printData.baseImponible = printData.total / ivaFact;
    printData.ivaAmount = printData.total - printData.baseImponible;

    this.printService.printTicket(printData);
    this.uiService.showSuccess('Imprimiendo pre-cuenta...');
  }

  private printSaleTicket(sale: any, soldLines: any[]) {
    const restaurant = this.stateService.state.restaurant;
    const restaurantName = restaurant ? (restaurant.legal_name || restaurant.name) : 'Mi Restaurante';
    const now = new Date();
    
    const printData: PrintData = {
      restaurantName: restaurantName,
      ticketNumber: sale.ticket_number || sale.uuid.substring(0, 8),
      date: now.toLocaleDateString(),
      hour: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: soldLines.map(line => {
        const product = this.stateService.state.products.find(p => p.uuid === line.product_uuid);
        return {
          quantity: line.quantity,
          concept: product?.name || 'Producto',
          price: line.price / 100,
          total: (line.price * line.quantity) / 100
        };
      }),
      ivaPercentage: soldLines.length > 0 ? soldLines[0].tax_percentage : 0,
      baseImponible: 0, // Se calculará abajo
      ivaAmount: 0,    // Se calculará abajo
      total: sale.total / 100
    };

    // Calcular desglose de IVA de forma simplificada para el ticket
    // (En un sistema real se haría por cada línea y tipo de IVA)
    const total = sale.total / 100;
    const ivaFact = 1 + (printData.ivaPercentage / 100);
    printData.baseImponible = total / ivaFact;
    printData.ivaAmount = total - printData.baseImponible;

    this.printService.printTicket(printData);
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
