import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { AuthService } from '@services/auth/auth.service';
import { searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonMenuButton,
    IonButtons,
  ],
})
export class AdminHeaderComponent {
  @Input() restaurantName: string | undefined;
  @Input() showMenuButton: boolean = true;
  @Input() isLive: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ searchOutline });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
