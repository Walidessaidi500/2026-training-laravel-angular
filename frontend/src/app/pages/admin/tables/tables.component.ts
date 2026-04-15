import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController, 
  AlertController, 
  ToastController,
  IonContent,
  IonIcon,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AuthService } from '@services/auth/auth.service';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { TablesFormComponent } from '@components/tables-form/tables-form.component';
import {
  gridOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  peopleOutline,
  personOutline,
  ellipsisVerticalOutline,
  addOutline,
  restaurantOutline,
  closeOutline,
  trashOutline,
  createOutline
} from 'ionicons/icons';
import { TableService, Table } from '@services/domain/table.service';
import { ZoneService, Zone } from '@services/domain/zone.service';

export interface TablesByZone {
  zone: Zone;
  tables: Table[];
}


@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonIcon, 
    IonSkeletonText, 
    AccessDeniedComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TablesComponent implements OnInit {

  public currentUser: any = null;
  public isAdmin: boolean = false;
  public isSupervisor: boolean = false;
  public isLoading: boolean = true;

  public zones: Zone[] = [];
  public allTables: Table[] = [];
  public groupedTables: TablesByZone[] = [];

  public activeZoneId: string = 'all';

  constructor(
    private authService: AuthService,
    private tableService: TableService,
    private zoneService: ZoneService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {
    addIcons({
      'grid-outline': gridOutline,
      'alert-circle-outline': alertCircleOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'time-outline': timeOutline,
      'people-outline': peopleOutline,
      'person-outline': personOutline,
      'ellipsis-vertical-outline': ellipsisVerticalOutline,
      'add-outline': addOutline,
      'restaurant-outline': restaurantOutline,
      'close-outline': closeOutline,
      'trash-outline': trashOutline,
      'create-outline': createOutline
    });
  }

  public async onAddTable(zoneId?: string): Promise<void> {
    const selectedZone = this.zones.find(z => z.uuid === zoneId);
    
    
    if (!zoneId && this.zones.length > 0) {
      const alert = await this.alertCtrl.create({
        header: 'Nueva Mesa',
        subHeader: 'Selecciona la zona',
        inputs: this.zones.map(z => ({
          name: 'zone_id',
          type: 'radio',
          label: z.name,
          value: z.uuid,
          checked: z.uuid === this.zones[0].uuid
        })),
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Siguiente',
            handler: (selectedZoneId) => {
              if (selectedZoneId) {
                this.promptTableName(selectedZoneId, this.zones.find(z => z.uuid === selectedZoneId)?.name);
              }
            }
          }
        ]
      });
      await alert.present();
    } else if (zoneId) {
      
      this.promptTableName(zoneId, selectedZone?.name);
    } else {
      this.showToast('Primero debes crear al menos una zona', 'danger');
    }
  }

  private async promptTableName(zoneId: string, zoneName?: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Mesa',
      subHeader: zoneName ? `Zona: ${zoneName}` : undefined,
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre (ej: Mesa 1, Terraza 4...)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            if (!data.name) return false;
            this.isLoading = true;
            this.tableService.create({
              name: data.name,
              zone_id: zoneId
            }).subscribe({
              next: () => {
                this.showToast('Mesa creada correctamente');
                this.loadData();
              },
              error: () => {
                this.showToast('Error al crear la mesa', 'danger');
                this.isLoading = false;
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  public async onEditTable(table: Table): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TablesFormComponent,
      componentProps: {
        table,
        zones: this.zones
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.isLoading = true;
      this.tableService.update(table.uuid, data).subscribe({
        next: () => {
          this.showToast('Mesa actualizada correctamente');
          this.loadData();
        },
        error: () => {
          this.showToast('Error al actualizar la mesa', 'danger');
          this.isLoading = false;
        }
      });
    }
  }

  public async deleteTable(table: Table): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Mesa',
      message: `¿Estás seguro de que quieres eliminar la mesa "${table.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.isLoading = true;
            this.tableService.delete(table.uuid).subscribe({
              next: () => {
                this.showToast('Mesa eliminada correctamente');
                this.loadData();
              },
              error: () => {
                this.showToast('Error al eliminar la mesa', 'danger');
                this.isLoading = false;
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    const role = this.currentUser?.role;

    if (!this.currentUser || (role !== 'admin' && role !== 'supervisor')) {
      this.isAdmin = false;
      this.isSupervisor = false;
      this.isLoading = false;
      return;
    }
    
    this.isAdmin = role === 'admin';
    this.isSupervisor = role === 'supervisor';
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    
    this.zoneService.list(1, 100).subscribe({
      next: (zoneResponse) => {
        this.zones = zoneResponse.data;
        
        this.tableService.list().subscribe({
          next: (tableResponse) => {
            this.allTables = tableResponse.data;
            this.filterByZone('all');
            this.isLoading = false;
          },
          error: () => {
            this.showToast('Error al cargar las mesas', 'danger');
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.showToast('Error al cargar las zonas', 'danger');
        this.isLoading = false;
      }
    });
  }

  public filterByZone(zoneId: string): void {
    this.activeZoneId = zoneId;
    
    if (zoneId === 'all') {
      
      this.groupedTables = this.zones.map(zone => ({
        zone,
        tables: this.allTables.filter(t => t.zone_id === zone.uuid)
      }));
    } else {
      
      const selectedZone = this.zones.find(z => z.uuid === zoneId);
      if (selectedZone) {
        this.groupedTables = [{
          zone: selectedZone,
          tables: this.allTables.filter(t => t.zone_id === zoneId)
        }];
      } else {
        this.groupedTables = [];
      }
    }
  }

  public getActiveZoneName(): string {
    if (this.activeZoneId === 'all') return 'Todas las zonas';
    return this.zones.find(z => z.uuid === this.activeZoneId)?.name || '';
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}