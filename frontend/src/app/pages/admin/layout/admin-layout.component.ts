import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSplitPane,
  IonMenu,
} from '@ionic/angular/standalone';
import { AuthService } from '@services/auth/auth.service';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '@components/admin-header/admin-header.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IonContent,
    IonSplitPane,
    IonMenu,
    AdminHeaderComponent,
    SidebarComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    this.authService.user$.subscribe(user => {
      if (!user) {
        this.restaurantName = 'Restaurante';
        return;
      }
      // Mostrar el nombre del usuario como título del header
      this.restaurantName = user.name || 'Restaurante';
    });
  }

  navigateTo(path: string | Event): void {
    const pathString = typeof path === 'string' ? path : String(path);
    this.selectedMenu = pathString;
    this.router.navigate(['/admin', pathString]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
