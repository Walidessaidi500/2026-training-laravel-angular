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


interface Tax {
  uuid: string;
  name: string;
  rate: number;
  active: boolean;
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
    total: 0,
    active: 0,
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
        this.taxes = response.data || response || [];
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
    this.taxStats.active = this.taxes.filter((t) => t.active).length;
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
    // Implementar lógica con el Modal cuando acabe TaxFormComponent
    console.log('Abrir modal para nuevo impuesto');
    /*
    const modal = await this.modalController.create({
      component: TaxFormComponent,
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
       this.handleCreateTax(data);
    }
    */
  }

  async editTax(tax: Tax): Promise<void> {
    console.log('Editar impuesto', tax);
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
    this.taxService.delete(uuid).subscribe({
      next: () => {
        this.showToast('Impuesto eliminado exitosamente', 'success', 'checkmark-circle');
        this.loadTaxes();
      },
      error: (error) => {
        console.error('Error deleting tax:', error);
        this.showToast('Error al eliminar el impuesto', 'danger', 'alert-circle');
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