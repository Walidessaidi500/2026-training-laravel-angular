import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonIcon, 
  IonButtons, IonSearchbar
} from '@ionic/angular/standalone';
import { TableService, Table } from '../../../../services/backoffice/zone.service';
import { ZoneService, Zone } from '../../../../services/backoffice/zone.service';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, restaurantOutline } from 'ionicons/icons';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonButton, IonIcon, 
    IonButtons, IonSearchbar
  ]
})
export class TableListComponent implements OnInit {
  private readonly tableService = inject(TableService);
  private readonly zoneService = inject(ZoneService);
  
  tables: Table[] = [];
  zones: { [key: string]: string } = {};
  filteredTables: Table[] = [];

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, restaurantOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.zoneService.getZones().subscribe(zones => {
      zones.forEach(z => this.zones[z.uuid] = z.name);
      this.loadTables();
    });
  }

  loadTables() {
    this.tableService.getTables().subscribe(data => {
      this.tables = data;
      this.filteredTables = data;
    });
  }

  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.filteredTables = this.tables.filter(t => t.name.toLowerCase().includes(query));
  }

  deleteTable(uuid: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      this.tableService.deleteTable(uuid).subscribe(() => {
        this.loadTables();
      });
    }
  }

  getZoneName(uuid: string): string {
    return this.zones[uuid] || 'Cargando...';
  }
}

