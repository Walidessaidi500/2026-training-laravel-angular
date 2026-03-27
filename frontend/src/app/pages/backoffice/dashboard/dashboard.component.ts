import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonIcon 
} from '@ionic/angular/standalone';
import { ProductService } from '../../../services/backoffice/product.service';
import { FamilyService } from '../../../services/backoffice/family.service';
import { ZoneService, TableService } from '../../../services/backoffice/zone.service';
import { addIcons } from 'ionicons';
import { fastFoodOutline, pricetagsOutline, mapOutline, restaurantOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardSubtitle, IonCardTitle, IonIcon
  ]
})
export class DashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly familyService = inject(FamilyService);
  private readonly zoneService = inject(ZoneService);
  private readonly tableService = inject(TableService);

  stats = {
    products: 0,
    families: 0,
    zones: 0,
    tables: 0
  };

  constructor() {
    addIcons({ fastFoodOutline, pricetagsOutline, mapOutline, restaurantOutline });
  }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.productService.getProducts().subscribe(data => this.stats.products = data.length);
    this.familyService.getFamilies().subscribe(data => this.stats.families = data.length);
    this.zoneService.getZones().subscribe(data => this.stats.zones = data.length);
    this.tableService.getTables().subscribe(data => this.stats.tables = data.length);
  }
}

