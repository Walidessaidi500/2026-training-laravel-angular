import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonButton, IonContent, IonIcon, IonBadge
} from '@ionic/angular/standalone';
import { Product, ProductOption } from '@services/domain/product.service';
import { addIcons } from 'ionicons';
import { closeOutline, fastFoodOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-product-options-modal',
  templateUrl: './tpv-product-options-modal.component.html',
  styleUrls: ['./tpv-product-options-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, IonModal, IonHeader, IonToolbar,
    IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonBadge
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TpvProductOptionsModalComponent {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Input() taxPercentage = 0;

  @Output() close = new EventEmitter<void>();
  @Output() selectOption = new EventEmitter<ProductOption | undefined>();

  constructor() {
    addIcons({ closeOutline, fastFoodOutline, checkmarkCircleOutline });
  }

  onClose() {
    this.close.emit();
  }

  onSelectOption(option?: ProductOption) {
    this.selectOption.emit(option);
  }

  getPriceWithTax(option?: ProductOption): number {
    if (!this.product) return 0;
    const basePrice = this.product.priceInCents + (option ? option.price_change : 0);
    return basePrice * (1 + this.taxPercentage / 100);
  }
}
