import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonList, IonItem, IonLabel,
  IonSkeletonText, IonSearchbar, IonSelect, IonSelectOption,
  IonNote, ModalController,
  IonInfiniteScroll, IonInfiniteScrollContent, IonSegment, IonSegmentButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  cubeOutline, cube, addOutline,
  createOutline, trashOutline, checkmarkCircle,
  closeCircle, alertCircle, optionsOutline, warningOutline, receiptOutline,
  chevronBackOutline, chevronForwardOutline, infiniteOutline, listOutline
} from 'ionicons/icons';

import { AuthService } from '@services/auth/auth.service';
import { ProductService } from '@services/domain/product.service';
import { FamilyService } from '@services/domain/family.service';
import { TaxService } from '@services/domain/tax.service';
import { UiService } from '@services/ui.service';
import { FilterService } from '@services/filter.service';
import { UtilsService } from '@services/utils.service';
import { CrudHelperService } from '@services/crud-helper.service';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { ProductFormComponent, ProductFormData } from '@components/product-form/product-form.component';

// Pipes
import { PricePipe } from '@shared/pipes/price.pipe';
import { ActiveStatusPipe } from '@shared/pipes/active-status.pipe';
import { StockStatusPipe } from '@shared/pipes/stock-status.pipe';
import { FallbackPipe } from '@shared/pipes/fallback.pipe';

export interface Product {
  uuid: string;
  name: string;
  priceInCents: number;
  stock: number;
  active: boolean;
  family_id: string;
  tax_id: string;
  family_name?: string; 
  tax_name?: string;    
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonIcon, IonList,
    IonItem, IonLabel, IonSkeletonText, IonSearchbar,
    IonSelect, IonSelectOption, IonNote, IonInfiniteScroll,
    IonInfiniteScrollContent, IonSegment, IonSegmentButton,
    AccessDeniedComponent,
    PricePipe, ActiveStatusPipe, StockStatusPipe, FallbackPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsPage implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  isSupervisor = false;
  isLoading = true;

  // Datos base
  products: Product[] = [];
  families: any[] = [];
  taxes: any[] = [];


  filteredProducts: Product[] = [];

  // Filtros
  searchTerm = '';
  selectedFamily = 'all';
  selectedTax = 'all';
  selectedStatus = 'all';
  selectedStock = 'all';
  displayMode: 'scroll' | 'pagination' = 'scroll';

  productStats = {
    total: 0,
    active: 0,
    outOfStock: 0
  };


  currentPage = 1;
  lastPage = 1;
  perPage = 10; // Reducimos para que la paginación sea más evidente
  isInfiniteDisabled = false;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private familyService: FamilyService,
    private taxService: TaxService,
    private modalController: ModalController,
    private uiService: UiService,
    private filterService: FilterService,
    private utilsService: UtilsService,
    private crudHelper: CrudHelperService
  ) {
    addIcons({
      'cube-outline': cubeOutline,
      'cube': cube,
      'add-outline': addOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'close-circle': closeCircle,
      'alert-circle': alertCircle,
      'options-outline': optionsOutline,
      'warning-outline': warningOutline,
      'receipt-outline': receiptOutline,
      'chevron-back-outline': chevronBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'infinite-outline': infiniteOutline,
      'list-outline': listOutline
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    if (!this.currentUser || (!this.authService.hasRole('admin') && !this.authService.hasRole('supervisor'))) {
      this.isAdmin = false;
      this.isSupervisor = false;
      this.isLoading = false;
      return;
    }

    this.isAdmin = this.authService.hasRole('admin');
    this.isSupervisor = this.authService.hasRole('supervisor');
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading = true;

    this.familyService.list().subscribe((res: any) => {
      this.families = res.data || res || [];
      this.taxService.list().subscribe((taxRes: any) => {
        this.taxes = taxRes.data || taxRes || [];
        this.loadProducts();
      });
    });
  }

  onDisplayModeChange(): void {
    this.loadProducts();
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  private loadProducts(isAppend: boolean = false, event?: any): void {
    if (!isAppend) {
      this.isLoading = true;
      this.currentPage = !isAppend && this.displayMode === 'scroll' ? 1 : this.currentPage;
      this.isInfiniteDisabled = false;
    }

    this.productService.list(this.currentPage, this.perPage).subscribe({
      next: (response: any) => {
        const rawProducts = response.data || response || [];
        this.lastPage = response.meta?.last_page || 1;

        const mappedProducts = rawProducts.map((p: Product) => ({
          ...p,
          family_name: this.families.find(f => f.uuid === p.family_id)?.name || 'Sin Familia',
          tax_name: this.taxes.find(t => t.uuid === p.tax_id)?.name || 'Sin Impuesto'
        }));

        if (isAppend) {
          this.products = [...this.products, ...mappedProducts];
        } else {
          this.products = mappedProducts;
        }

        this.isInfiniteDisabled = this.currentPage >= this.lastPage;

        this.calculateStats(response.meta?.aggregates);
        this.applyFilters();
        this.isLoading = false;

        if (event) {
          event.target.complete();
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  loadMore(event: any) {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadProducts(true, event);
    } else {
      event.target.complete();
      this.isInfiniteDisabled = true;
    }
  }

  private calculateStats(aggregates?: any): void {
    if (aggregates) {
      this.productStats.total = aggregates.total;
      this.productStats.active = aggregates.active;
      this.productStats.outOfStock = aggregates.out_of_stock;
    } else {
      const stats = this.utilsService.calculateStats(this.products, [
        { label: 'active', filterFn: (p) => p.active },
        { label: 'outOfStock', filterFn: (p) => p.stock <= 0 },
      ]);
      this.productStats = {
        total: stats['total'],
        active: stats['active'],
        outOfStock: stats['outOfStock'],
      };
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredProducts = this.filterService.applyFilters(this.products, {
      searchTerm: this.searchTerm,
      searchProperties: ['name'],
      status: this.selectedStatus,
      propertyFilters: [
        { property: 'family_id', value: this.selectedFamily },
        { property: 'tax_id', value: this.selectedTax },
      ],
      customFilters: [
        (p) => {
          if (this.selectedStock === 'all') return true;
          if (this.selectedStock === 'in_stock') return p.stock > 0;
          if (this.selectedStock === 'out_of_stock') return p.stock <= 0;
          if (this.selectedStock === 'low_stock') return p.stock > 0 && p.stock <= 5;
          return true;
        }
      ]
    });
  }

  async addNewProduct(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductFormComponent,
      componentProps: {
        product: null,
        families: this.families,
        taxes: this.taxes
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


  private handleCreateProduct(formData: ProductFormData): void {
    this.isLoading = true;
    this.crudHelper.handleCreate(
      this.productService.create(formData),
      'Producto creado exitosamente',
      () => this.loadProducts(),
      () => this.isLoading = false
    );
  }

  private handleUpdateProduct(uuid: string, formData: ProductFormData): void {
    this.isLoading = true;
    this.crudHelper.handleUpdate(
      this.productService.update(uuid, formData),
      'Producto actualizado exitosamente',
      () => this.loadProducts(),
      () => this.isLoading = false
    );
  }



  async deleteProduct(product: Product): Promise<void> {
    await this.uiService.confirmDelete(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar ' + product.name + '? Esta acción no se puede deshacer.',
      () => this.performDeleteProduct(product.uuid)
    );
  }

  private performDeleteProduct(uuid: string): void {
    this.isLoading = true;
    this.crudHelper.handleDelete(
      this.productService.delete(uuid),
      'Producto eliminado exitosamente',
      () => this.loadProducts(),
      () => this.isLoading = false
    );
  }

  toggleProductStatus(product: Product, event: Event): void {
    event.stopPropagation();
    const previousStatus = product.active;
    product.active = !previousStatus;
    const updatePayload: any = {
      name: product.name,
      priceInCents: product.priceInCents,
      stock: product.stock,
      family_id: product.family_id,
      tax_id: product.tax_id,
      active: product.active
    };

    this.productService.update(product.uuid, updatePayload).subscribe({
      next: () => {
        this.uiService.showSuccess(`Producto ${product.active ? 'activado' : 'desactivada'}`);        

        this.calculateStats();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);

        product.active = previousStatus;
        this.uiService.showError('Error al cambiar el estado');
      }
    });
  }
}