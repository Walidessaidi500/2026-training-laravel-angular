import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonIcon, 
  IonButtons
} from '@ionic/angular/standalone';
import { ZoneService, Zone } from '../../../../services/backoffice/zone.service';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, mapOutline } from 'ionicons/icons';

@Component({
  selector: 'app-zone-list',
  templateUrl: './zone-list.component.html',
  styleUrls: ['./zone-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonButton, IonIcon, 
    IonButtons
  ]
})
export class ZoneListComponent implements OnInit {
  private readonly zoneService = inject(ZoneService);
  
  zones: Zone[] = [];

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, mapOutline });
  }

  ngOnInit() {
    this.loadZones();
  }

  loadZones() {
    this.zoneService.getZones().subscribe(data => this.zones = data);
  }

  deleteZone(uuid: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta zona? Esto puede afectar a las mesas asociadas.')) {
      this.zoneService.deleteZone(uuid).subscribe(() => {
        this.loadZones();
      });
    }
  }
}

