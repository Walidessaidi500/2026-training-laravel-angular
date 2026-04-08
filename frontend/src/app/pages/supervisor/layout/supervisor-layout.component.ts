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
  selector: 'app-supervisor-layout',
  templateUrl: './supervisor-layout.component.html',
  styleUrls: ['./supervisor-layout.component.scss'],
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
export class SupervisorLayoutComponent implements OnInit {
  selectedMenu = 'dashboard';
  restaurantName: string | undefined;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAuthenticatedUser();
  }

  private loadAuthenticatedUser(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.restaurantName = 'Restaurante';
      return;
    }
    this.restaurantName = user.name || 'Restaurante';
  }

  navigateTo(path: string | Event): void {
    const pathString = typeof path === 'string' ? path : String(path);
    this.selectedMenu = pathString;
    this.router.navigate(['/supervisor', pathString]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

}
