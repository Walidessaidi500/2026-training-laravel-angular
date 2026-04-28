import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Product } from '@services/domain/product.service';
import { Tax } from '@services/domain/tax.service';
import { Table } from '@services/domain/table.service';
import { addIcons } from 'ionicons';
import { checkboxOutline, squareOutline, removeOutline, addOutline, cashOutline, cardOutline } from 'ionicons/icons';

interface CartItem {
  uuid?: string;
  product: Product;
  quantity: number;
  selected?: boolean;
  selectedQuantity?: number;
}

@Component({
  selector: 'app-tpv-payment-modal',
  templateUrl: './tpv-payment-modal.component.html',
  styleUrls: ['./tpv-payment-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, CurrencyPipe]
})
export class TpvPaymentModalComponent {
  @Input() isOpen = false;
  @Input() selectedTable: Table | null = null;
  @Input() total: number = 0;
  @Input() selectedTotal: number = 0;
  @Input() cart: CartItem[] = [];
  @Input() taxes: Tax[] = [];
  
  @Input() paymentType: 'total' | 'split' = 'total';
  @Input() paymentMethod: 'cash' | 'card' | 'mixed' = 'cash';
  @Input() amountCash: number = 0;
  @Input() amountCard: number = 0;
  @Input() amountGiven: number = 0;
  @Input() changeAmount: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() setPaymentType = new EventEmitter<'total' | 'split'>();
  @Output() setPaymentMethod = new EventEmitter<'cash' | 'card' | 'mixed'>();
  @Output() toggleItemSelection = new EventEmitter<CartItem>();
  @Output() updateSelectedQuantity = new EventEmitter<{item: CartItem, delta: number}>();
  @Output() amountCashChange = new EventEmitter<number>();
  @Output() amountGivenChange = new EventEmitter<number>();
  @Output() confirmPayment = new EventEmitter<void>();

  constructor() {
    addIcons({ checkboxOutline, squareOutline, removeOutline, addOutline, cashOutline, cardOutline });
  }

  onClose() { this.close.emit(); }
  onSetPaymentType(type: 'total' | 'split') { this.setPaymentType.emit(type); }
  onSetPaymentMethod(method: 'cash' | 'card' | 'mixed') { this.setPaymentMethod.emit(method); }
  onToggleItemSelection(item: CartItem) { this.toggleItemSelection.emit(item); }
  onUpdateSelectedQuantity(item: CartItem, delta: number) { this.updateSelectedQuantity.emit({item, delta}); }
  
  onAmountCashChange(val: any) { this.amountCashChange.emit(val.target.value); }
  onAmountGivenChange(val: any) { this.amountGivenChange.emit(val.target.value); }
  
  onConfirmPayment() { this.confirmPayment.emit(); }

  getPriceWithTax(product: Product): number {
    const tax = this.taxes.find(t => t.uuid === product.tax_id);
    const percentage = tax ? tax.percentage : 0;
    return product.priceInCents * (1 + percentage / 100);
  }
}
