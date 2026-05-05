import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Product } from '@services/domain/product.service';
import { Tax } from '@services/domain/tax.service';
import { Order } from '@services/domain/order.service';
import { addIcons } from 'ionicons';
import { receiptOutline, peopleOutline, printOutline, trashOutline, cartOutline, removeOutline, addOutline, cloudUploadOutline, walletOutline } from 'ionicons/icons';

interface CartItem {
  uuid?: string;
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-tpv-cart',
  templateUrl: './tpv-cart.component.html',
  styleUrls: ['./tpv-cart.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe]
})
export class TpvCartComponent {
  @Input() cart: CartItem[] = [];
  @Input() currentOrder: Order | null = null;
  @Input() tempDiners: string = '1';
  @Input() taxes: Tax[] = [];
  @Input() total: number = 0;

  @Output() editDiners = new EventEmitter<void>();
  @Output() printProvisional = new EventEmitter<void>();
  @Output() clearCart = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() addItem = new EventEmitter<Product>();
  @Output() sendOrder = new EventEmitter<void>();
  @Output() closeTicket = new EventEmitter<void>();

  constructor() {
    addIcons({ receiptOutline, peopleOutline, printOutline, trashOutline, cartOutline, removeOutline, addOutline, cloudUploadOutline, walletOutline });
  }

  getPriceWithTax(product: Product): number {
    const tax = this.taxes.find(t => t.uuid === product.tax_id);
    const percentage = tax ? tax.percentage : 0;
    return product.priceInCents * (1 + percentage / 100);
  }

  onEditDiners() { this.editDiners.emit(); }
  onPrintProvisional() { this.printProvisional.emit(); }
  onClearCart() { this.clearCart.emit(); }
  onRemoveItem(index: number) { this.removeItem.emit(index); }
  onAddItem(product: Product) { this.addItem.emit(product); }
  onSendOrder() { this.sendOrder.emit(); }
  onCloseTicket() { this.closeTicket.emit(); }
}
