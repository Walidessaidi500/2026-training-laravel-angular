import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
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
import { TaxService } from '@services/domain/tax.service';
import { UiService } from '@services/ui.service';
import { FilterService } from '@services/filter.service';
import { UtilsService } from '@services/utils.service';
import { CrudHelperService } from '@services/crud-helper.service';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { TaxFormComponent, TaxFormData } from '@components/tax-form/tax-form.component';


interface Tax {
  uuid: string;
  name: string;
  rate: number;
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
export class TaxesPage implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  isLoading = true;

  taxes: Tax[] = [];
  filteredTaxes: Tax[] = [];
  searchTerm = '';

  taxStats = {
    total: 0
  };

  constructor(
    private authService: AuthService,
    private taxService: TaxService,
    private modalController: ModalController,
    private uiService: UiService,
    private filterService: FilterService,
    private utilsService: UtilsService,
    private crudHelper: CrudHelperService
  ) {
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
    this.loadTaxes();
  }

  private loadTaxes(): void {
    this.isLoading = true;
    this.taxService.list().subscribe({
      next: (response: any) => {
        
        const rawData = response.data || response || [];
        this.taxes = rawData.map((t: any) => ({
          ...t,
          rate: t.percentage !== undefined ? t.percentage : (t.rate || 0)
        }));

        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading taxes:', error);
        this.isLoading = false;
      },
    });
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
    this.isLoading = true;
    
    const apiData = {
      name: formData.name,
      percentage: formData.rate
    };

    this.crudHelper.handleCreate(
      this.taxService.create(apiData),
      'Impuesto creado exitosamente',
      () => this.loadTaxes(),
      () => this.isLoading = false
    );
  }

  private handleUpdateTax(uuid: string, formData: TaxFormData): void {
    this.isLoading = true;
    
    const apiData = {
      name: formData.name,
      percentage: formData.rate
    };

    this.crudHelper.handleUpdate(
      this.taxService.update(uuid, apiData),
      'Impuesto actualizado exitosamente',
      () => this.loadTaxes(),
      () => this.isLoading = false
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
    this.isLoading = true;
    this.crudHelper.handleDelete(
      this.taxService.delete(uuid),
      'Impuesto eliminado exitosamente',
      () => this.loadTaxes(),
      () => this.isLoading = false
    );
  }
}