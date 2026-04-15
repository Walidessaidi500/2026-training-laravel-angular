import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ModalController, 
  AlertController, 
  ToastController,
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
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
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
    if (!this.currentUser || this.currentUser.role !== 'admin') {
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
        this.showToast('Error al cargar las zonas', 'danger', 'alert-circle');
      }
    });
  }

  public onSearchChange(event: any): void {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredZones = [...this.zones];
      return;
    }
    
    this.filteredZones = this.zones.filter(zone => 
      zone.name.toLowerCase().includes(this.searchTerm)
    );
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
            this.zoneService.create(data.name).subscribe({
              next: () => {
                this.showToast('Zona creada correctamente', 'success', 'checkmark-circle');
                this.loadZones();
              },
              error: () => this.showToast('Error al crear la zona', 'danger', 'alert-circle')
            });
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
            this.zoneService.update(zone.uuid, data.name).subscribe({
              next: () => {
                this.showToast('Zona actualizada', 'success', 'checkmark-circle');
                this.loadZones();
              },
              error: () => this.showToast('Error al actualizar', 'danger', 'alert-circle')
            });
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  public async onDeleteZone(zone: Zone): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Zona',
      message: `¿Estás seguro de que quieres eliminar la zona "${zone.name}"?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.zoneService.delete(zone.uuid).subscribe({
              next: () => {
                this.showToast('Zona eliminada', 'success', 'checkmark-circle');
                this.loadZones();
              },
              error: (err) => {
                const message = err.status === 400 ? 'No se puede eliminar una zona con mesas' : 'Error al eliminar';
                this.showToast(message, 'danger', 'alert-circle');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success', icon: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      icon,
      position: 'top'
    });
    await toast.present();
  }
}