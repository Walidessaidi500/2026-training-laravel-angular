import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonList, IonItem, IonLabel,
  IonSkeletonText, IonSearchbar, IonSegment, IonSegmentButton,
  ModalController, AlertController, ToastController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  folderOutline, folder, addOutline,
  createOutline, trashOutline, checkmarkCircle,
  closeCircle, alertCircle
} from 'ionicons/icons';

import { AuthService } from '@services/auth/auth.service';
import { FamilyService } from '@services/domain/family.service';
import { FamilyFormComponent, FamilyFormData } from '@components/families-form/families-form.component';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';


export interface Family {
  uuid: string;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-families',
  templateUrl: './families.page.html',
  styleUrls: ['./families.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonIcon, IonList,
    IonItem, IonLabel, IonSkeletonText, IonSearchbar, IonSegment,
    IonSegmentButton, AccessDeniedComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FamiliesPage implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  isSupervisor = false;
  isLoading = true;

  families: Family[] = [];
  filteredFamilies: Family[] = [];
  searchTerm = '';
  selectedStatus = 'all';

  familyStats = {
    total: 0,
    active: 0,
  };

  constructor(
    private authService: AuthService,
    private familyService: FamilyService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'folder-outline': folderOutline,
      'folder': folder,
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
    const role = this.currentUser?.role;

    if (!this.currentUser || role !== 'admin') {
      this.isAdmin = false;
      this.isSupervisor = false;
      this.isLoading = false;
      return;
    }

    this.isAdmin = true;
    this.isSupervisor = false;
    this.loadFamilies();
  }

  private loadFamilies(): void {
    this.isLoading = true;
    this.familyService.list().subscribe({
      next: (response: any) => {
        this.families = response.data || response || [];
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading families:', error);
        this.isLoading = false;
      },
    });
  }

  private calculateStats(): void {
    this.familyStats.total = this.families.length;
    this.familyStats.active = this.families.filter(f => f.active).length;
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.detail.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.families;

    if (this.searchTerm) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(this.searchTerm)
      );
    }

    if (this.selectedStatus !== 'all') {
      const wantActive = this.selectedStatus === 'active';
      filtered = filtered.filter((f) => f.active === wantActive);
    }

    this.filteredFamilies = filtered;
  }

  async addNewFamily(): Promise<void> {
    const modal = await this.modalController.create({
      component: FamilyFormComponent,
      componentProps: { family: null },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss<FamilyFormData>();
    if (data) this.handleCreateFamily(data);
  }

  async editFamily(family: Family): Promise<void> {
    const modal = await this.modalController.create({
      component: FamilyFormComponent,
      componentProps: {
        family: { uuid: family.uuid, name: family.name, active: family.active },
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss<FamilyFormData>();
    if (data) this.handleUpdateFamily(family.uuid, data);
  }

  private handleCreateFamily(formData: FamilyFormData): void {
    this.isLoading = true;
    this.familyService.create(formData).subscribe({
      next: () => {
        this.showToast('Familia creada exitosamente', 'success', 'checkmark-circle');
        this.loadFamilies();
      },
      error: () => {
        this.showToast('Error al crear la familia', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  private handleUpdateFamily(uuid: string, formData: FamilyFormData): void {
    this.isLoading = true;
    this.familyService.update(uuid, formData).subscribe({
      next: () => {
        this.showToast('Familia actualizada exitosamente', 'success', 'checkmark-circle');
        this.loadFamilies();
      },
      error: () => {
        this.showToast('Error al actualizar la familia', 'danger', 'alert-circle');
        this.isLoading = false;
      },
    });
  }

  async deleteFamily(family: Family): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar Familia',
      message: `¿Estás seguro de que deseas eliminar <strong>${family.name}</strong>? Los productos asociados podrían quedarse sin categoría.`,
      backdropDismiss: false,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.performDeleteFamily(family.uuid),
        },
      ],
    });
    await alert.present();
  }

  toggleFamilyStatus(family: Family): void {
    this.familyService.toggle(family.uuid).subscribe({
      next: (updatedFamily: any) => {
        family.active = !family.active;
        this.calculateStats();
        this.showToast(
          `Familia ${family.active ? 'activada' : 'desactivada'} correctamente`,
          'success',
          family.active ? 'checkmark-circle' : 'close-circle'
        );
      },
      error: () => {
        this.showToast('Error al cambiar el estado de la familia', 'danger', 'alert-circle');
      }
    });
  }

  private performDeleteFamily(uuid: string): void {
    this.familyService.delete(uuid).subscribe({
      next: () => {
        this.showToast('Familia eliminada exitosamente', 'success', 'checkmark-circle');
        this.loadFamilies();
      },
      error: () => this.showToast('Error al eliminar la familia', 'danger', 'alert-circle'),
    });
  }

  private async showToast(message: string, color: 'success' | 'danger', icon: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'top', color, icon });
    await toast.present();
  }
}