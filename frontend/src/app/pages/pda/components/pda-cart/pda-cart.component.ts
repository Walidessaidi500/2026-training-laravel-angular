import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, cartOutline } from 'ionicons/icons';
import { CartItem } from '@pages/tpv/services/cart.service';

@Component({
  selector: 'app-pda-cart',
  templateUrl: './pda-cart.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe]
})
export class PdaCartComponent {
  @Input() cart: CartItem[] = [];
  @Input() total: number = 0;

  @Output() removeItem = new EventEmitter<number>();
  @Output() sendOrder = new EventEmitter<void>();
  @Output() pay = new EventEmitter<void>();

  constructor() {
    addIcons({ trashOutline, cartOutline });
  }

  onRemove(index: number) { this.removeItem.emit(index); }
  onSend() { this.sendOrder.emit(); }
  onPay() { this.pay.emit(); }

}
