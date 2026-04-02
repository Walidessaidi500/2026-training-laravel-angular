import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonList, IonItem, IonLabel,
  IonSkeletonText, IonSearchbar, IonSelect, IonSelectOption,
  ModalController, AlertController, ToastController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  cubeOutline, cube, addOutline, searchOutline,
  createOutline, trashOutline, checkmarkCircle,
  closeCircle, alertCircle, optionsOutline, warningOutline
} from 'ionicons/icons';

import { AuthService } from '@services/auth/auth.service';
import { ProductService } from '@services/domain/product.service';
import { FamilyService } from '@services/domain/family.service';
import { TaxService } from '@services/domain/tax.service';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { ProductFormComponent, ProductFormData } from '@components/product-form/product-form.component';

export interface Product {
  uuid: string;
  name: string;
  priceInCents: number;
  stock: number; // Cantidad
  active: boolean;
  family_id: string;
  tax_id: string;
  family_name?: string; // Para mostrar en la vista
  tax_name?: string;    // Para mostrar en la vista
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonIcon, IonList,
    IonItem, IonLabel, IonSkeletonText, IonSearchbar,
    IonSelect, IonSelectOption, AccessDeniedComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsPage implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  isLoading = true;

  // Datos base
  products: Product[] = [];
  families: any[] = [];
  taxes: any[] = [];

  // Array renderizado
  filteredProducts: Product[] = [];

  // Filtros
  searchTerm = '';
  selectedFamily = 'all';
  selectedTax = 'all';
  selectedStatus = 'all';
  selectedStock = 'all'; // all, in_stock, out_of_stock, low_stock

  productStats = {
    total: 0,
    active: 0,
    outOfStock: 0
  };

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private familyService: FamilyService,
    private taxService: TaxService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'cube-outline': cubeOutline,
      'cube': cube,
      'add-outline': addOutline,
      'search-outline': searchOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'close-circle': closeCircle,
      'alert-circle': alertCircle,
      'options-outline': optionsOutline,
      'warning-outline': warningOutline
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.isAdmin = false;
      this.isLoading = false;
      return;
    }
    this.isAdmin = true;
    this.loadInitialData();
  }

  // Cargamos productos, familias e impuestos para cruzar datos
  private loadInitialData(): void {
    this.isLoading = true;

    // Llamadas simultáneas (puedes usar forkJoin si lo prefieres)
    this.familyService.list().subscribe((res: any) => {
      this.families = res.data || res || [];
      this.taxService.list().subscribe((taxRes: any) => {
        this.taxes = taxRes.data || taxRes || [];
        this.loadProducts();
      });
    });
  }

  private loadProducts(): void {
    this.productService.list().subscribe({
      next: (response: any) => {
        const rawProducts = response.data || response || [];

        // Mapeamos para inyectar el nombre de la familia y el impuesto y facilitar la vista
        this.products = rawProducts.map((p: Product) => ({
          ...p,
          family_name: this.families.find(f => f.id === p.family_id)?.name || 'Sin Familia',
          tax_name: this.taxes.find(t => t.id === p.tax_id)?.name || 'Sin Impuesto'
        }));

        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  private calculateStats(): void {
    this.productStats.total = this.products.length;
    this.productStats.active = this.products.filter(p => p.active).length;
    this.productStats.outOfStock = this.products.filter(p => p.stock <= 0).length;
  }

  // --- MÉTODOS DE FILTRADO ---
  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products];

    // 1. Búsqueda por texto (Nombre)
    if (this.searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(this.searchTerm));
    }

    // 2. Filtro por Familia
    if (this.selectedFamily !== 'all') {
      filtered = filtered.filter(p => p.family_id === this.selectedFamily);
    }

    // 3. Filtro por Impuesto
    if (this.selectedTax !== 'all') {
      filtered = filtered.filter(p => p.tax_id === this.selectedTax);
    }

    // 4. Filtro por Estado (Activo/Inactivo)
    if (this.selectedStatus !== 'all') {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter(p => p.active === isActive);
    }

    // 5. Filtro por Cantidad/Stock
    if (this.selectedStock !== 'all') {
      if (this.selectedStock === 'in_stock') {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (this.selectedStock === 'out_of_stock') {
        filtered = filtered.filter(p => p.stock <= 0);
      } else if (this.selectedStock === 'low_stock') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= 5); // Consideramos low_stock <= 5
      }
    }

    this.filteredProducts = filtered;
  }

  // --- CRUD METHODS ---
  async addNewProduct(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductFormComponent,
      componentProps: {
        product: null,
        families: this.families, // Pasamos las familias cargadas
        taxes: this.taxes        // Pasamos los impuestos cargados
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<ProductFormData>();
    if (data) this.handleCreateProduct(data);
  }


  async editProduct(product: Product): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductFormComponent,
      componentProps: {
        product: product,
        families: this.families,
        taxes: this.taxes
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<ProductFormData>();
    if (data) this.handleUpdateProduct(product.uuid, data);
  }

  // --- MÉTODOS DE CONEXIÓN CON EL SERVICIO ---

  private handleCreateProduct(formData: ProductFormData): void {
    this.isLoading = true;

    // Delegamos al servicio de infraestructura pasando el DTO
    this.productService.create(formData).subscribe({
      next: () => {
        this.showToast('Producto creado exitosamente', 'success', 'checkmark-circle');
        this.loadProducts(); // Recargamos para obtener el UUID generado y cruzar datos
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.showToast('Error al crear el producto', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  private handleUpdateProduct(uuid: string, formData: ProductFormData): void {
    this.isLoading = true;

    // Delegamos al servicio de infraestructura pasando el UUID y el DTO
    this.productService.update(uuid, formData).subscribe({
      next: () => {
        this.showToast('Producto actualizado exitosamente', 'success', 'checkmark-circle');
        this.loadProducts(); // Recargamos para refrescar la vista
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.showToast('Error al actualizar el producto', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  private performDelete(uuid: string): void {
    this.productService.delete(uuid).subscribe({
      next: () => {
        this.showToast('Producto eliminado exitosamente', 'success', 'checkmark-circle');
        this.loadProducts();
      },
      error: () => this.showToast('Error al eliminar el producto', 'danger', 'alert-circle'),
    });
  }

  async deleteProduct(product: Product): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar Producto',
      message: `¿Estás seguro de que deseas eliminar <strong>${product.name}</strong>? Esta acción no se puede deshacer.`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.performDeleteProduct(product.uuid);
          }
        }
      ],
    });

    await alert.present();
  }

  private performDeleteProduct(uuid: string): void {
    this.isLoading = true;

    // Delegamos al adaptador de infraestructura (ProductService)
    // Este servicio hará la petición HTTP hacia tu controlador en Laravel,
    // el cual invocará tu Caso de Uso (ej. DeleteProductUseCase).
    this.productService.delete(uuid).subscribe({
      next: () => {
        this.showToast('Producto eliminado exitosamente', 'success', 'checkmark-circle');
        this.loadProducts(); // Recargamos el catálogo
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.showToast('Error al eliminar el producto', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  private async showToast(message: string, color: 'success' | 'danger', icon: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'top', color, icon });
    await toast.present();
  }
}