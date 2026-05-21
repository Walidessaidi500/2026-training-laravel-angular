import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import {
  gridOutline, layersOutline, fastFoodOutline, cartOutline, arrowBackOutline,
  personCircleOutline, receiptOutline, checkmarkCircleOutline, trashOutline,
  addOutline, removeOutline, closeOutline, cloudUploadOutline, walletOutline,
  logOutOutline, chevronDownOutline, peopleOutline, printOutline, backspaceOutline,
  checkmarkCircle, alertCircle, cashOutline, cardOutline, checkboxOutline, squareOutline,
  restaurantOutline, listOutline, wallet
} from 'ionicons/icons';

import { Table } from '@services/domain/table.service';
import { Product } from '@services/domain/product.service';
import { User } from '@services/domain/user.service';
import { AuthService } from '@services/auth/auth.service';
import { UiService } from '@app/core/services/ui/ui.service';
import { SaleService } from '@services/domain/sale.service';
import { Order } from '@services/domain/order.service';

import { TpvStateService } from '../tpv/services/tpv-state.service';
import { CartService } from '../tpv/services/cart.service';

import { TpvTableSelectionComponent } from '../tpv/components/tpv-table-selection/tpv-table-selection.component';
import { TpvUserSelectionModalComponent } from '../tpv/components/tpv-user-selection-modal/tpv-user-selection-modal.component';
import { TpvPinModalComponent } from '../tpv/components/tpv-pin-modal/tpv-pin-modal.component';
import { TpvDinersModalComponent } from '../tpv/components/tpv-diners-modal/tpv-diners-modal.component';
import { TpvPaymentModalComponent } from '../tpv/components/tpv-payment-modal/tpv-payment-modal.component';

import { PdaHeaderComponent } from './layout/pda-header/pda-header.component';
import { PdaProductListComponent } from './components/pda-product-list/pda-product-list.component';
import { PdaCartComponent } from './components/pda-cart/pda-cart.component';

export type PdaViewState = 'tables' | 'order' | 'cart';

const PDA_WORKER_SESSION_KEY = 'pda_worker_session';
const SESSION_DURATION = 4 * 60 * 60 * 1000; 

@Component({
  selector: 'app-pda',
  templateUrl: './pda.page.html',
  styleUrls: ['./pda.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, FormsModule, CurrencyPipe,
    TpvTableSelectionComponent, TpvUserSelectionModalComponent, TpvPinModalComponent,
    TpvDinersModalComponent, TpvPaymentModalComponent,
    PdaHeaderComponent, PdaProductListComponent, PdaCartComponent
  ]
})
export class PdaPage implements OnInit, OnDestroy {
  public readonly stateService = inject(TpvStateService);
  public readonly cartService = inject(CartService);
  public readonly uiService = inject(UiService);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly saleService = inject(SaleService);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly modalCtrl = inject(ModalController);

  public pdaViewState: PdaViewState = 'tables';
  public currentUser = this.authService.getUser();

  public paymentType: 'total' | 'split' = 'total';
  public paymentMethod: 'cash' | 'card' | 'mixed' = 'cash';
  public amountCash: number = 0;
  public amountCard: number = 0;
  public amountGiven: number = 0;
  public paymentUser: User | null = null;
  public isProcessingPayment = false;

  public get changeAmount(): number {
    return this.amountGiven - this.amountCash;
  }

  public get activeWorkerName(): string {
    return this.stateService.state.selectedUserForPin?.name || this.getValidWorkerSession()?.name || '';
  }

  constructor() {
    addIcons({
      gridOutline, layersOutline, fastFoodOutline, cartOutline, arrowBackOutline,
      personCircleOutline, receiptOutline, checkmarkCircleOutline, trashOutline,
      addOutline, removeOutline, closeOutline, cloudUploadOutline, walletOutline,
      logOutOutline, chevronDownOutline, peopleOutline, printOutline, backspaceOutline,
      checkmarkCircle, alertCircle, cashOutline, cardOutline, checkboxOutline, squareOutline,
      restaurantOutline, listOutline, wallet
    });
  }

  ngOnInit() {
    this.stateService.loadInitialData().subscribe(res => {
      this.cartService.setTaxes(res.taxes.data);
      
      const worker = this.getValidWorkerSession();
      if (worker) {
        this.stateService.setShowPinModal(false, worker);
      }
    });

    this.stateService.startPolling(5000);
  }

  ngOnDestroy() {
    this.stateService.stopPolling();
  }

  public setViewState(view: PdaViewState) {
    this.pdaViewState = view;
  }

  private getValidWorkerSession(): User | null {
    const sessionStr = localStorage.getItem(PDA_WORKER_SESSION_KEY);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      if (Date.now() < session.expiresAt) {
        return session.user;
      }
      localStorage.removeItem(PDA_WORKER_SESSION_KEY);
    } catch (e) {
      localStorage.removeItem(PDA_WORKER_SESSION_KEY);
    }
    return null;
  }

  private saveWorkerSession(user: User) {
    const session = {
      user,
      expiresAt: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(PDA_WORKER_SESSION_KEY, JSON.stringify(session));
  }

  public onTableClick(table: Table) {
    const effectiveTable = table.joined_to_uuid 
      ? this.stateService.state.tables.find(t => t.uuid === table.joined_to_uuid) || table
      : table;

    this.stateService.setSelectedTable(effectiveTable);

    if (this.stateService.state.tableOrders[effectiveTable.uuid]) {
      this.cartService.loadOrderForTable(effectiveTable.uuid, this.stateService.state.products)
        .subscribe(() => {
          const worker = this.getValidWorkerSession();
          if (worker && !this.stateService.state.selectedUserForPin) {
            this.stateService.setShowPinModal(false, worker);
          }
          this.pdaViewState = 'order';
        });
    } else {
      const worker = this.getValidWorkerSession();
      if (worker) {
        this.stateService.setShowPinModal(false, worker);
        this.stateService.setShowUserSelection(false, 'opening');
        this.stateService.setShowDinersSelection(true);
      } else {
        this.stateService.setShowUserSelection(true, 'opening');
      }
    }
  }

  public backToTables() {
    this.pdaViewState = 'tables';
    this.stateService.setSelectedTable(null);
    this.cartService.clearCart();
    this.stateService.refreshTableStatus(); 
  }

  public selectUser(user: User) {
    this.stateService.setShowUserSelection(false);
    this.stateService.setShowPinModal(true, user);
  }

  public onPinConfirm() {
    const user = this.stateService.state.selectedUserForPin;
    const pin = this.stateService.state.pinBuffer;

    if (user?.pin === pin) {
      this.saveWorkerSession(user);
      this.stateService.setShowPinModal(false, user); 
      this.stateService.resetPinBuffer();
      
      if (this.stateService.state.userSelectionContext === 'opening') {
        this.stateService.setShowDinersSelection(true);
      } else {
        this.processClosing(user);
      }
    } else {
      this.uiService.showError('PIN incorrecto');
      this.stateService.resetPinBuffer();
    }
  }

  public onDinersConfirm() {
    const diners = parseInt(this.cartService.tempDinersValue);
    const table = this.stateService.state.selectedTable;
    const user = this.stateService.state.selectedUserForPin;

    if (table && user) {
      this.stateService.setShowDinersSelection(false);
      this.cartService.clearCart();
      this.pdaViewState = 'order';
    }
  }

  public selectFamily(familyUuid: string) {
    this.stateService.selectFamily(familyUuid);
  }

  public addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.uiService.showSuccess(`Añadido: ${product.name}`);
  }

  public sendOrder() {
    const table = this.stateService.state.selectedTable;
    const user = this.stateService.state.selectedUserForPin;

    if (!table || !user) return;

    this.cartService.syncOrder(table.uuid, user.uuid).subscribe({
      next: () => {
        this.uiService.showSuccess('Pedido enviado');
        this.backToTables();
      },
      error: (err) => {
        this.uiService.showError('Error al enviar pedido');
      }
    });
  }


  public closeTicket() {
    if (this.cartService.cartValue.length === 0 || !this.stateService.state.selectedTable) return;
    
    const worker = this.getValidWorkerSession();
    if (worker) {
      this.stateService.setShowPinModal(false, worker);
      this.processClosing(worker);
    } else {
      this.stateService.setShowUserSelection(true, 'closing');
    }
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
      next: () => {
        this.isProcessingPayment = false;
        this.uiService.showSuccess('Pago procesado');
        

        this.stateService.loadInitialData().subscribe();
        
        const isPayingTotal = this.paymentType === 'total' || 
          this.cartService.getSelectedTotal('split') === this.cartService.getTotal();

        if (isPayingTotal) {
          this.stateService.setShowPaymentModal(false);
          this.backToTables();
        } else {
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

  public logout() {
    localStorage.removeItem(PDA_WORKER_SESSION_KEY);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
