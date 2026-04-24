import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController, 
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonSearchbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  businessOutline,
  addOutline,
  gridOutline,
  searchOutline,
  createOutline,
  trashOutline,
  checkmarkCircle,
  alertCircle,
  closeCircle
} from 'ionicons/icons';
import { ZoneService, Zone } from '@services/domain/zone.service';
import { AuthService } from '@services/auth/auth.service';
import { UiService } from '@app/core/services/ui/ui.service';
import { FilterService } from '@app/core/services/helper/filter.service';
import { UtilsService } from '@app/core/services/helper/utils.service';
import { CrudHelperService } from '@app/core/services/helper/crud-helper.service';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';

@Component({
  selector: 'app-zone-list',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
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
    AccessDeniedComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ZoneListComponent implements OnInit {
  
  public currentUser: any = null;
  public isAdmin: boolean = false;
  public isLoading: boolean = true;
  
  public zones: Zone[] = [];
  public filteredZones: Zone[] = [];
  public searchTerm: string = '';
  public totalZones: number = 0;

  constructor(
    private authService: AuthService,
    private zoneService: ZoneService,
    private uiService: UiService,
    private alertCtrl: AlertController,
    private filterService: FilterService,
    private utilsService: UtilsService,
    private crudHelper: CrudHelperService
  ) {
    addIcons({
      'business-outline': businessOutline,
      'add-outline': addOutline,
      'grid-outline': gridOutline,
      'search-outline': searchOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'alert-circle': alertCircle,
      'close-circle': closeCircle
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
    this.loadZones();
  }

  public loadZones(): void {
    this.isLoading = true;
    this.zoneService.list(1, 100).subscribe({
      next: (response) => {
        this.zones = response.data;
        this.applyFilters();
        this.totalZones = response.meta.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading zones:', err);
        this.isLoading = false;
        this.uiService.showError('Error al cargar las zonas');
      }
    });
  }

  public onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredZones = this.filterService.applyFilters(this.zones, {
      searchTerm: this.searchTerm,
      searchProperties: ['name']
    });
  }

  
  // Acciones
  

  public async onCreateZone(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Zona',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la zona (ej: Terraza)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            if (!data.name) return false;
            this.crudHelper.handleCreate(
              this.zoneService.create(data.name),
              'Zona creada correctamente',
              () => this.loadZones()
            );
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  public async onEditZone(zone: Zone): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Editar Zona',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: zone.name,
          placeholder: 'Nombre de la zona'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.name) return false;
            this.crudHelper.handleUpdate(
              this.zoneService.update(zone.uuid, data.name),
              'Zona actualizada',
              () => this.loadZones()
            );
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  public async onDeleteZone(zone: Zone): Promise<void> {
    await this.uiService.confirmDelete(
      'Eliminar Zona',
      `¿Estás seguro de que quieres eliminar la zona "${zone.name}"?`,
      () => {
        this.crudHelper.handleDelete(
          this.zoneService.delete(zone.uuid),
          'Zona eliminada',
          () => this.loadZones(),
          (err) => {
            const message = err.status === 400 ? 'No se puede eliminar una zona con mesas' : 'Error al eliminar';
            this.uiService.showError(message);
          }
        );
      }
    );
  }
}