import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
} from '@ionic/angular/standalone';
import { StatCardComponent } from '@components/stat-card/stat-card.component';
import { ProductService } from '@services/domain/product.service';
import { FamilyService } from '@services/domain/family.service';
import { TaxService } from '@services/domain/tax.service';
import { ZoneService } from '@services/domain/table.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    StatCardComponent,
  ],
})
export class DashboardPage implements OnInit {
  totalProducts = 0;
  activeProducts = 0;
  totalFamilies = 0;
  activeFamilies = 0;
  totalTaxes = 0;
  totalZones = 0;
  isLoading = true;

  constructor(
    private productService: ProductService,
    private familyService: FamilyService,
    private taxService: TaxService,
    private zoneService: ZoneService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.productService.list().subscribe({
      next: (response) => {
        this.totalProducts = response.meta.total;
        this.activeProducts = response.data.filter((p) => p.active).length;
      },
      error: (error) => console.error('Error loading products:', error),
    });

    this.familyService.list().subscribe({
      next: (response) => {
        this.totalFamilies = response.meta.total;
        this.activeFamilies = response.data.filter((f) => f.active).length;
      },
      error: (error) => console.error('Error loading families:', error),
    });

    this.taxService.list().subscribe({
      next: (response) => {
        this.totalTaxes = response.meta.total;
      },
      error: (error) => console.error('Error loading taxes:', error),
    });

    this.zoneService.list().subscribe({
      next: (response) => {
        this.totalZones = response.meta.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading zones:', error);
        this.isLoading = false;
      },
    });
  }
}
