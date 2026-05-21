import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Product } from '@services/domain/product.service';
import { Family } from '@services/domain/family.service';

@Component({
  selector: 'app-pda-product-list',
  templateUrl: './pda-product-list.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe]
})
export class PdaProductListComponent {
  @Input() families: Family[] = [];
  @Input() filteredProducts: Product[] = [];
  @Input() selectedFamilyUuid: string | null = null;

  @Output() familySelect = new EventEmitter<string>();
  @Output() productSelect = new EventEmitter<Product>();

  onFamilyClick(uuid: string) { this.familySelect.emit(uuid); }
  onProductClick(product: Product) { this.productSelect.emit(product); }
}
