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
} from '@ionic/angular/standalone';

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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarComponent implements OnInit {
  @Input() activeItem: string = 'dashboard';
  @Output() onNavigate = new EventEmitter<string>();
  @Output() onLogout = new EventEmitter<void>();

  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isAdmin = user?.role === 'admin';
  }

  navigate(item: string): void {
    this.activeItem = item;
    this.onNavigate.emit(item);
  }

  logout(): void {
    this.onLogout.emit();
  }
}
