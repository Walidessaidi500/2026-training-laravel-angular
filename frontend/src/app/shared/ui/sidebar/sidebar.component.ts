import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import {
  IonHeader,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonFooter,
  IonPopover,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  settingsOutline, 
  logOutOutline, 
  chevronDownOutline,
  gridOutline,
  peopleOutline,
  calculatorOutline,
  folderOutline,
  restaurantOutline,
  mapOutline
} from 'ionicons/icons';
import { map } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonFooter,
    IonPopover,
    IonLabel,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarComponent {
  @Input() activeItem: string = 'dashboard';
  @Output() onNavigate = new EventEmitter<string>();
  @Output() onLogout = new EventEmitter<void>();

  @ViewChild('userPopover') userPopover!: IonPopover;

  private authService = inject(AuthService);
  private router = inject(Router);

  // Observables reactivos
  isAdmin$ = this.authService.user$.pipe(map(user => user?.role === 'admin'));
  isSupervisor$ = this.authService.user$.pipe(map(user => user?.role === 'admin' || user?.role === 'supervisor'));

  constructor() {
    addIcons({ 
      personOutline, 
      settingsOutline, 
      logOutOutline, 
      chevronDownOutline,
      gridOutline,
      peopleOutline,
      calculatorOutline,
      folderOutline,
      restaurantOutline,
      mapOutline
    });
  }

  navigate(item: string): void {
    this.activeItem = item;
    if (this.userPopover) this.userPopover.dismiss();
    this.onNavigate.emit(item);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    if (this.userPopover) this.userPopover.dismiss();
    this.onLogout.emit();
  }
  
  openUserMenu(event: Event): void {
    if (this.userPopover) {
      this.userPopover.event = event;
      this.userPopover.present();
    }
  }
}
