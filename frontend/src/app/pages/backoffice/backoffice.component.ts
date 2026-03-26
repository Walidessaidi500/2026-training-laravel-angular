import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { IonSplitPane, IonMenu } from '@ionic/angular/standalone';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { AuthService } from '../../core/infrastructure/auth/auth.service';

import { addIcons } from 'ionicons';
import {
  gridOutline,
  pricetagsOutline,
  receiptOutline,
  fastFoodOutline,
  mapOutline,
  restaurantOutline,
  logOutOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [
    RouterOutlet,
    IonSplitPane,
    IonMenu,
    SidebarComponent,
  ],
  templateUrl: './backoffice.component.html',
  styleUrls: ['./backoffice.component.css'],
})
export class BackofficeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuItems = [
    { label: 'Dashboard', icon: 'grid-outline', route: '/backoffice/dashboard' },
    { label: 'Familias', icon: 'pricetags-outline', route: '/backoffice/families' },
    { label: 'Impuestos', icon: 'receipt-outline', route: '/backoffice/taxes' },
    { label: 'Productos', icon: 'fast-food-outline', route: '/backoffice/products' },
    { label: 'Zonas', icon: 'map-outline', route: '/backoffice/zones' },
    { label: 'Mesas', icon: 'restaurant-outline', route: '/backoffice/tables' },
  ];

  constructor() {
    addIcons({
      gridOutline,
      pricetagsOutline,
      receiptOutline,
      fastFoodOutline,
      mapOutline,
      restaurantOutline,
      logOutOutline,
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
