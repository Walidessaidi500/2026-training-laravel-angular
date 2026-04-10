import { Component, OnInit, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { personOutline, settingsOutline, logOutOutline, chevronDownOutline } from 'ionicons/icons';

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
export class SidebarComponent implements OnInit {
  @Input() activeItem: string = 'dashboard';
  @Output() onNavigate = new EventEmitter<string>();
  @Output() onLogout = new EventEmitter<void>();

  isAdmin: boolean = false;
  isSupervisor: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ personOutline, settingsOutline, logOutOutline, chevronDownOutline });
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.isSupervisor = user?.role === 'supervisor';
    });
  }

  navigate(item: string): void {
    this.activeItem = item;
    this.onNavigate.emit(item);
  }

  logout(): void {
    this.onLogout.emit();
  }
}
