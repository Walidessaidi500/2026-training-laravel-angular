import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonList,
  IonItem, IonLabel,
  IonSkeletonText,
  IonSearchbar,
  ModalController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  receiptOutline,
  receipt,
  addOutline,
  createOutline,
  trashOutline,
  checkmarkCircle,
  closeCircle,
  alertCircle
} from 'ionicons/icons';

import { AuthService } from '@services/auth/auth.service';
import { InventoryFacade } from '@app/core/facades/inventory.facade';
import { UiService } from '@app/core/services/ui/ui.service';
import { FilterService } from '@app/core/services/helper/filter.service';
import { UtilsService } from '@app/core/services/helper/utils.service';
import { CrudHelperService } from '@app/core/services/helper/crud-helper.service';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { TaxFormComponent, TaxFormData } from '@components/tax-form/tax-form.component';
import { Subject, takeUntil, map } from 'rxjs';


interface Tax {
  uuid: string;
  name: string;
  rate: number;
  percentage?: number;
  restaurant_id?: number;
}

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.page.html',
  styleUrls: ['./taxes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonSearchbar,
    AccessDeniedComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TaxesPage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly facade = inject(InventoryFacade);
  private readonly modalController = inject(ModalController);
  private readonly uiService = inject(UiService);
  private readonly filterService = inject(FilterService);
  private readonly utilsService = inject(UtilsService);
  private readonly crudHelper = inject(CrudHelperService);

  private readonly destroy$ = new Subject<void>();

  currentUser: any = null;
  isAdmin = false;
  isLoading = true;

  taxes: Tax[] = [];
  filteredTaxes: Tax[] = [];
  searchTerm = '';

  taxStats = {
    total: 0
  };

  constructor() {
    addIcons({
      'receipt-outline': receiptOutline,
      'receipt': receipt,
      'add-outline': addOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'close-circle': closeCircle,
      'alert-circle': alertCircle
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    if (!this.currentUser || !this.authService.hasRole('admin')) {
      this.isAdmin = false;
      this.isLoading = false;
      return;
    }

    this.isAdmin = true;

    // Suscribirse a los datos del facade
    this.facade.taxes$
      .pipe(
        takeUntil(this.destroy$),
        map(taxes => taxes.map(t => ({
          ...t,
          rate: t.percentage || 0
        })))
      )
      .subscribe(mappedTaxes => {
        this.taxes = mappedTaxes as Tax[];
        this.calculateStats();
        this.applyFilters();
      });

    this.facade.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.facade.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateStats(): void {
    this.taxStats.total = this.taxes.length;
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredTaxes = this.filterService.applyFilters(this.taxes, {
      searchTerm: this.searchTerm,
      searchProperties: ['name']
    });
  }

  async addNewTax(): Promise<void> {
    const modal = await this.modalController.create({
      component: TaxFormComponent,
      componentProps: {
        tax: null,
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss<TaxFormData>();

    if (data) {
      this.handleCreateTax(data);
    }
  }

  async editTax(tax: Tax): Promise<void> {
    const modal = await this.modalController.create({
      component: TaxFormComponent,
      componentProps: {
        tax: {
          ...tax,
          rate: tax.rate 
        },
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss<TaxFormData>();

    if (data) {
      this.handleUpdateTax(tax.uuid, data);
    }
  }

  private handleCreateTax(formData: TaxFormData): void {
    const apiData = {
      name: formData.name,
      percentage: formData.rate
    };

    this.crudHelper.handleCreate(
      this.facade.createTax(apiData),
      'Impuesto creado exitosamente'
    );
  }

  private handleUpdateTax(uuid: string, formData: TaxFormData): void {
    const apiData = {
      name: formData.name,
      percentage: formData.rate
    };

    this.crudHelper.handleUpdate(
      this.facade.updateTax(uuid, apiData),
      'Impuesto actualizado exitosamente'
    );
  }

  async deleteTax(tax: Tax): Promise<void> {
    await this.uiService.confirmDelete(
      'Eliminar Impuesto',
      `¿Estás seguro de que deseas eliminar <strong>${tax.name}</strong>? Esta acción podría afectar a productos existentes.`,
      () => this.performDeleteTax(tax.uuid)
    );
  }

  private performDeleteTax(uuid: string): void {
    this.crudHelper.handleDelete(
      this.facade.deleteTax(uuid),
      'Impuesto eliminado exitosamente'
    );
  }
}
