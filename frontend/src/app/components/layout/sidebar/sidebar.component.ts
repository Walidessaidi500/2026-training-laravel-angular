import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { 
  IonContent, IonList, IonItem, IonLabel, 
  IonIcon, IonButtons, IonButton, 
  IonMenuToggle, IonHeader, IonToolbar, IonTitle 
} from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  ellipsisVertical, addOutline, 
  printOutline, walletOutline, logOutOutline
} from 'ionicons/icons';
import { ButtonComponent } from '../../ui/button/button.component';
import { CommonModule } from '@angular/common';

export interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonContent, IonList, IonItem, IonLabel, 
    IonIcon, IonButtons, IonButton, IonMenuToggle,
    IonHeader, IonToolbar, IonTitle,
    ButtonComponent
  ],
})
export class SidebarComponent implements OnInit {
  @Input() mode: 'nav' | 'order' = 'nav';
  @Input() title: string = 'Menú';
  @Input() meta: string = '';
  @Input() totalPrice: string = '0,00€';
  @Input() items: any[] = []; // Used for order mode
  @Input() menuItems: SidebarMenuItem[] = []; // Used for nav mode
  
  @Output() logout = new EventEmitter<void>();

  constructor() {
    addIcons({ ellipsisVertical, addOutline, printOutline, walletOutline, logOutOutline });
  }

  ngOnInit() {}
}
