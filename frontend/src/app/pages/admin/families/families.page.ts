import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject, OnDestroy } from '@angular/core';
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
import { InventoryFacade } from '@app/core/facades/inventory.facade';
import { UiService } from '@app/core/services/ui/ui.service';
import { FilterService } from '@app/core/services/helper/filter.service';
import { UtilsService } from '@app/core/services/helper/utils.service';
import { CrudHelperService } from '@app/core/services/helper/crud-helper.service';
import { FamilyFormComponent, FamilyFormData } from '@components/families-form/families-form.component';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';

// Pipes
import { ActiveStatusPipe } from '@shared/pipes/active-status.pipe';
import { Subject, takeUntil } from 'rxjs';

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
export class FamiliesPage implements OnInit, OnDestroy {
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

  constructor() {
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

    // Suscribirse a los datos del facade
    this.facade.families$
      .pipe(takeUntil(this.destroy$))
      .subscribe(families => {
        this.families = families as Family[];
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
    this.crudHelper.handleCreate(
      this.facade.createFamily(formData),
      'Familia creada exitosamente'
    );
  }

  private handleUpdateFamily(uuid: string, formData: FamilyFormData): void {
    this.crudHelper.handleUpdate(
      this.facade.updateFamily(uuid, formData),
      'Familia actualizada exitosamente'
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
      this.facade.deleteFamily(uuid),
      'Familia eliminada exitosamente'
    );
  }

  toggleFamilyStatus(family: Family, event: Event): void {
    event.stopPropagation();
    this.facade.toggleFamilyStatus(family.uuid).subscribe({
      next: (updated) => {
        this.uiService.showSuccess(`Familia ${updated.active ? 'activada' : 'desactivada'}`);
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.uiService.showError('Error al cambiar el estado');
      }
    });
  }
}
