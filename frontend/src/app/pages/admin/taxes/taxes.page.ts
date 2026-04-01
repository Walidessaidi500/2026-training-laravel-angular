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
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  receiptOutline,
  receipt,
  addOutline,
  searchOutline,
  createOutline,
  trashOutline,
  checkmarkCircle,
  closeCircle,
  alertCircle
} from 'ionicons/icons';

import { AuthService } from '@services/auth/auth.service';
import { TaxService } from '@services/domain/tax.service';
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
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'receipt-outline': receiptOutline,
      'receipt': receipt,
      'add-outline': addOutline,
      'search-outline': searchOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'close-circle': closeCircle,
      'alert-circle': alertCircle
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
    this.loadTaxes();
  }

  private loadTaxes(): void {
    this.isLoading = true;
    this.taxService.list().subscribe({
      next: (response: any) => {
        // Mapeamos 'percentage' del backend a 'rate' para el frontend
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
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredTaxes = this.taxes;
      return;
    }

    this.filteredTaxes = this.taxes.filter((t) =>
      t.name.toLowerCase().includes(this.searchTerm)
    );
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
          rate: tax.rate // Aseguramos que pasamos 'rate' al componente
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
    // Mapeamos 'rate' a 'percentage' para el backend
    const apiData = {
      name: formData.name,
      percentage: formData.rate
    };

    this.taxService.create(apiData).subscribe({
      next: () => {
        this.showToast('Impuesto creado exitosamente', 'success', 'checkmark-circle');
        this.loadTaxes();
      },
      error: (error) => {
        console.error('Error creating tax:', error);
        this.showToast('Error al crear el impuesto', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  private handleUpdateTax(uuid: string, formData: TaxFormData): void {
    this.isLoading = true;
    // Mapeamos 'rate' a 'percentage' para el backend
    const apiData = {
      name: formData.name,
      percentage: formData.rate
    };

    this.taxService.update(uuid, apiData).subscribe({
      next: () => {
        this.showToast('Impuesto actualizado exitosamente', 'success', 'checkmark-circle');
        this.loadTaxes();
      },
      error: (error) => {
        console.error('Error updating tax:', error);
        this.showToast('Error al actualizar el impuesto', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  async deleteTax(tax: Tax): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar Impuesto',
      message: `¿Estás seguro de que deseas eliminar <strong>${tax.name}</strong>? Esta acción podría afectar a productos existentes.`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.performDeleteTax(tax.uuid);
          },
        },
      ],
    });

    await alert.present();
  }

  private performDeleteTax(uuid: string): void {
    this.isLoading = true;
    this.taxService.delete(uuid).subscribe({
      next: () => {
        this.showToast('Impuesto eliminado exitosamente', 'success', 'checkmark-circle');
        this.loadTaxes();
      },
      error: (error) => {
        console.error('Error deleting tax:', error);
        this.showToast('Error al eliminar el impuesto', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  private async showToast(message: string, color: 'success' | 'danger', icon: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
      icon,
    });
    await toast.present();
  }
}