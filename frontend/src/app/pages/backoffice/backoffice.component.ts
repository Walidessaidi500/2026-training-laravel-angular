import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import {
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
} from '@ionic/angular/standalone';
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
import { AuthService } from '../../core/infrastructure/auth/auth.service';

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
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
