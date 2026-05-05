import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Family } from '@services/domain/family.service';
import { Product } from '@services/domain/product.service';
import { Tax } from '@services/domain/tax.service';
import { addIcons } from 'ionicons';
import { layersOutline, fastFoodOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-order-management',
  templateUrl: './tpv-order-management.component.html',
  styleUrls: ['./tpv-order-management.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe]
})
export class TpvOrderManagementComponent {
  @Input() families: Family[] = [];
  @Input() selectedFamilyUuid: string | null = null;
  @Input() filteredProducts: Product[] = [];
  @Input() taxes: Tax[] = [];

  @Output() familySelect = new EventEmitter<string>();
  @Output() productSelect = new EventEmitter<Product>();

  constructor() {
    addIcons({ layersOutline, fastFoodOutline });
  }

  selectFamily(uuid: string) {
    this.familySelect.emit(uuid);
  }

  addToCart(product: Product) {
    this.productSelect.emit(product);
  }

  getPriceWithTax(product: Product): number {
    const tax = this.taxes.find(t => t.uuid === product.tax_id);
    const percentage = tax ? tax.percentage : 0;
    return product.priceInCents * (1 + percentage / 100);
  }
}
