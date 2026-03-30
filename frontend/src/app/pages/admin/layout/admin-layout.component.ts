import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '@services/auth/auth.service';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '@components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IonContent,
    IonToolbar,
    IonButton,
    IonIcon,
    AdminHeaderComponent,
  ],
})
export class AdminLayoutComponent implements OnInit {
  selectedMenu = 'dashboard';
  restaurantName: string | undefined;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAuthenticatedUser();
  }

  private loadAuthenticatedUser(): void {
    const user = this.authService.getUser();
    
    if (!user) {
      this.restaurantName = 'Restaurante';
      return;
    }

    // Mostrar el nombre del usuario como título del header
    this.restaurantName = user.name || 'Restaurante';
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
