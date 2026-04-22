import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonList, IonItem, IonLabel,
  IonSkeletonText, IonSearchbar, IonSegment, IonSegmentButton,
  ModalController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  folderOutline, folder, addOutline,
  createOutline, trashOutline, checkmarkCircle,
  closeCircle, alertCircle
} from 'ionicons/icons';

import { AuthService } from '@services/auth/auth.service';
import { FamilyService } from '@services/domain/family.service';
import { UiService } from '@services/ui.service';
import { FilterService } from '@services/filter.service';
import { UtilsService } from '@services/utils.service';
import { CrudHelperService } from '@services/crud-helper.service';
import { FamilyFormComponent, FamilyFormData } from '@components/families-form/families-form.component';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';

// Pipes
import { ActiveStatusPipe } from '@shared/pipes/active-status.pipe';

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
    IonSegmentButton, AccessDeniedComponent, ActiveStatusPipe
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
    private uiService: UiService,
    private filterService: FilterService,
    private utilsService: UtilsService,
    private crudHelper: CrudHelperService
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

    if (!this.currentUser || !this.authService.hasRole('admin')) {
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
    const stats = this.utilsService.calculateStats(this.families, [
      { label: 'active', filterFn: (f) => f.active },
    ]);
    this.familyStats = {
      total: stats['total'],
      active: stats['active'],
    };
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.detail.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredFamilies = this.filterService.applyFilters(this.families, {
      searchTerm: this.searchTerm,
      searchProperties: ['name'],
      status: this.selectedStatus
    });
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
    this.crudHelper.handleCreate(
      this.familyService.create(formData),
      'Familia creada exitosamente',
      () => this.loadFamilies(),
      () => this.isLoading = false
    );
  }

  private handleUpdateFamily(uuid: string, formData: FamilyFormData): void {
    this.isLoading = true;
    this.crudHelper.handleUpdate(
      this.familyService.update(uuid, formData),
      'Familia actualizada exitosamente',
      () => this.loadFamilies(),
      () => this.isLoading = false
    );
  }

  async deleteFamily(family: Family): Promise<void> {
    await this.uiService.confirmDelete(
      'Eliminar Familia',
      `¿Estás seguro de que deseas eliminar <strong>${family.name}</strong>? Los productos asociados podrían quedarse sin categoría.`,
      () => this.performDeleteFamily(family.uuid)
    );
  }

  private performDeleteFamily(uuid: string): void {
    this.crudHelper.handleDelete(
      this.familyService.delete(uuid),
      'Familia eliminada exitosamente',
      () => this.loadFamilies()
    );
  }

  toggleFamilyStatus(family: Family, event: Event): void {
      event.stopPropagation();
      const previousStatus = family.active;
      family.active = !previousStatus;
      const updatePayload: any = {
        name: family.name,
        active: family.active
      };
  
      this.familyService.update(family.uuid, updatePayload).subscribe({
        next: () => {
          this.uiService.showSuccess(`Familia ${family.active ? 'activada' : 'desactivada'}`);        
          
          this.calculateStats();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
  
          family.active = previousStatus;
          this.uiService.showError('Error al cambiar el estado');
        }
      });
    }
}