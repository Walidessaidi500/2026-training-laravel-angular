import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSplitPane,
  IonMenu,
  IonMenuButton,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '@services/auth/auth.service';
import { RestaurantService, Restaurant } from '@services/domain/restaurant.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSplitPane,
    IonMenu,
    IonMenuButton,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
  ],
})
export class AdminLayoutComponent implements OnInit {
  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  selectedMenu = 'dashboard';

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  private loadRestaurants(): void {
    this.restaurantService.list().subscribe({
      next: (response) => {
        this.restaurants = response.data;
        if (this.restaurants.length > 0) {
          this.selectedRestaurant = this.restaurants[0];
        }
      },
      error: (error) => console.error('Error loading restaurants:', error),
    });
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
  }

  navigateTo(path: string): void {
    this.selectedMenu = path;
    this.router.navigate(['/admin', path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
