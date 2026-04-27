import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
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

// Facades
import { InventoryFacade } from '@app/core/facades/inventory.facade';

// Services
import { AuthService } from '@services/auth/auth.service';
import { UiService } from '@app/core/services/ui/ui.service';
import { FilterService } from '@app/core/services/helper/filter.service';
import { UtilsService } from '@app/core/services/helper/utils.service';

// Components
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { ProductFormComponent, ProductFormData } from '@components/product-form/product-form.component';
import { PageHeaderComponent } from '@app/shared/ui/page-header/page-header.component';

// Pipes
import { PricePipe } from '@shared/pipes/price.pipe';
import { ActiveStatusPipe } from '@shared/pipes/active-status.pipe';
import { StockStatusPipe } from '@shared/pipes/stock-status.pipe';
import { FallbackPipe } from '@shared/pipes/fallback.pipe';

// Types
import { Product } from '@services/domain/product.service';
import { combineLatest, map, Observable, firstValueFrom, BehaviorSubject } from 'rxjs';

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
    AccessDeniedComponent, PageHeaderComponent,
    PricePipe, ActiveStatusPipe, StockStatusPipe, FallbackPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsPage implements OnInit {
  private readonly inventoryFacade = inject(InventoryFacade);
  private readonly authService = inject(AuthService);
  private readonly modalController = inject(ModalController);
  private readonly uiService = inject(UiService);
  private readonly filterService = inject(FilterService);
  private readonly utilsService = inject(UtilsService);

  // State Observables
  public readonly products$ = this.inventoryFacade.products$;
  public readonly families$ = this.inventoryFacade.families$;
  public readonly taxes$ = this.inventoryFacade.taxes$;
  public readonly isLoading$ = this.inventoryFacade.isLoading$;

  // Combined State for the template
  public filteredProducts$: Observable<any[]>;
  public displayedProducts$: Observable<any[]>;
  public productStats$: Observable<any>;

  // UI State
  public currentUser: any = null;
  public isAdmin = false;
  public isSupervisor = false;

  // Filtros
  public searchTerm = '';
  public selectedFamily = 'all';
  public selectedTax = 'all';
  public selectedStatus = 'all';
  public selectedStock = 'all';
  public displayMode: 'scroll' | 'pagination' = 'scroll';

  // Paginación local
  public currentPage = 1;
  public lastPage = 1;
  public perPage = 10;
  public isInfiniteDisabled = false;
  
  private filterTrigger = new BehaviorSubject<void>(undefined);
  private paginationTrigger = new BehaviorSubject<number>(1);

  constructor() {
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

    // Initialize filtered products stream
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.families$,
      this.taxes$,
      this.filterTrigger
    ]).pipe(
      map(([products, families, taxes]) => {
        const mapped = products.map(p => ({
          ...p,
          family_name: families.find(f => f.uuid === p.family_id)?.name || 'Sin Familia',
          tax_name: taxes.find(t => t.uuid === p.tax_id)?.name || 'Sin Impuesto'
        }));
        return this.applyFilters(mapped);
      })
    );

    // Initialize displayed products (paginated) stream
    this.displayedProducts$ = combineLatest([
      this.filteredProducts$,
      this.paginationTrigger
    ]).pipe(
      map(([filtered, page]) => {
        this.lastPage = Math.ceil(filtered.length / this.perPage) || 1;
        this.currentPage = page;
        this.isInfiniteDisabled = this.currentPage >= this.lastPage;

        if (this.displayMode === 'scroll') {
          return filtered.slice(0, this.currentPage * this.perPage);
        } else {
          const start = (this.currentPage - 1) * this.perPage;
          return filtered.slice(start, start + this.perPage);
        }
      })
    );

    // Initialize stats stream
    this.productStats$ = this.products$.pipe(
      map(products => {
        const stats = this.utilsService.calculateStats(products, [
          { label: 'active', filterFn: (p) => p.active },
          { label: 'outOfStock', filterFn: (p) => p.stock <= 0 },
        ]);
        return {
          total: stats['total'],
          active: stats['active'],
          outOfStock: stats['outOfStock'],
        };
      })
    );
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.isAdmin = this.authService.hasRole('admin');
    this.isSupervisor = this.authService.hasRole('supervisor');

    if (this.isAdmin || this.isSupervisor) {
      this.inventoryFacade.loadAll();
    }
  }

  onDisplayModeChange(): void {
    this.paginationTrigger.next(1);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.paginationTrigger.next(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.paginationTrigger.next(this.currentPage - 1);
    }
  }

  loadMore(event: any): void {
    if (this.currentPage < this.lastPage) {
      this.paginationTrigger.next(this.currentPage + 1);
    } else {
      this.isInfiniteDisabled = true;
    }
    setTimeout(() => {
      event.target.complete();
    }, 100);
  }

  onFilterChange(): void {
    this.refreshFilters();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.refreshFilters();
  }

  private refreshFilters(): void {
    this.paginationTrigger.next(1);
    this.filterTrigger.next();
  }

  private applyFilters(products: any[]): any[] {
    return this.filterService.applyFilters(products, {
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
    const families = await firstValueFrom(this.inventoryFacade.families$);
    const taxes = await firstValueFrom(this.inventoryFacade.taxes$);

    const modal = await this.modalController.create({
      component: ProductFormComponent,
      componentProps: { product: null, families, taxes },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<ProductFormData>();
    if (data) {
      this.inventoryFacade.createProduct(data).subscribe({
        next: () => this.uiService.showSuccess('Producto creado exitosamente'),
        error: (err) => this.uiService.showError('Error al crear: ' + (err.error?.message || 'Error desconocido'))
      });
    }
  }

  async editProduct(product: Product): Promise<void> {
    const families = await firstValueFrom(this.inventoryFacade.families$);
    const taxes = await firstValueFrom(this.inventoryFacade.taxes$);

    const modal = await this.modalController.create({
      component: ProductFormComponent,
      componentProps: { product, families, taxes },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<ProductFormData>();
    if (data) {
      this.inventoryFacade.updateProduct(product.uuid, data).subscribe({
        next: () => this.uiService.showSuccess('Producto actualizado exitosamente'),
        error: (err) => this.uiService.showError('Error al actualizar')
      });
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    await this.uiService.confirmDelete(
      'Eliminar Producto',
      `¿Estás seguro de que deseas eliminar ${product.name}?`,
      () => {
        this.inventoryFacade.deleteProduct(product.uuid).subscribe({
          next: () => this.uiService.showSuccess('Producto eliminado'),
          error: () => this.uiService.showError('Error al eliminar')
        });
      }
    );
  }

  toggleProductStatus(product: Product, event: Event): void {
    event.stopPropagation();
    this.inventoryFacade.toggleProductStatus(product.uuid).subscribe({
      next: (updated) => this.uiService.showSuccess(`Producto ${updated.active ? 'activado' : 'desactivado'}`),
      error: () => this.uiService.showError('Error al cambiar el estado')
    });
  }
}
