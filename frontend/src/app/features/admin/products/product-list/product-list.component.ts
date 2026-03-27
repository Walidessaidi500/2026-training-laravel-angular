import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonIcon, 
  IonThumbnail, IonBadge, IonSearchbar, IonButtons
} from '@ionic/angular/standalone';
import { ProductService, Product } from '../../../../services/backoffice/product.service';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonButton, IonIcon, 
    IonThumbnail, IonBadge, IonSearchbar, IonButtons
  ]
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  
  products: Product[] = [];
  filteredProducts: Product[] = [];

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, eyeOffOutline, eyeOutline });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
    });
  }

  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(query));
  }

  toggleActive(product: Product) {
    this.productService.toggleActive(product.uuid).subscribe(() => {
      product.active = !product.active;
    });
  }

  deleteProduct(uuid: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(uuid).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  formatPrice(price: number): string {
    return (price / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  }
}

