import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonSearchbar,
  IonBadge,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  personOutline,
  fingerPrintOutline,
  listOutline,
  chevronDownOutline,
  chevronUpOutline,
  flashOutline,
  eyeOutline,
  cartOutline,
  cashOutline,
  cubeOutline,
  peopleOutline,
  folderOutline,
  receiptOutline,
  restaurantOutline,
  trashOutline,
  createOutline,
  addCircleOutline
} from 'ionicons/icons';

// Facades
import { MovementsFacade } from '@app/core/facades/movements.facade';

// Services
import { AuthService } from '@services/auth/auth.service';
import { UtilsService } from '@app/core/services/helper/utils.service';

// Components
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { PageHeaderComponent } from '@app/shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonSearchbar,
    IonBadge,
    IonButton,
    IonButtons,
    AccessDeniedComponent,
    PageHeaderComponent
  ]
})
export class MovementsPage implements OnInit {
  private readonly movementsFacade = inject(MovementsFacade);
  private readonly authService = inject(AuthService);
  private readonly utilsService = inject(UtilsService);

  public readonly movements$ = this.movementsFacade.movements$;
  public readonly isLoading$ = this.movementsFacade.isLoading$;
  public readonly meta$ = this.movementsFacade.meta$;

  public currentUser: any = null;
  public isAdmin = false;
  public expandedMovement: string | null = null;

  constructor() {
    addIcons({
      'time-outline': timeOutline,
      'person-outline': personOutline,
      'finger-print-outline': fingerPrintOutline,
      'list-outline': listOutline,
      'chevron-down-outline': chevronDownOutline,
      'chevron-up-outline': chevronUpOutline,
      'flash-outline': flashOutline,
      'eye-outline': eyeOutline,
      'cart-outline': cartOutline,
      'cash-outline': cashOutline,
      'cube-outline': cubeOutline,
      'people-outline': peopleOutline,
      'folder-outline': folderOutline,
      'receipt-outline': receiptOutline,
      'restaurant-outline': restaurantOutline,
      'trash-outline': trashOutline,
      'create-outline': createOutline,
      'add-circle-outline': addCircleOutline
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.isAdmin = this.authService.hasRole('admin');

    if (this.isAdmin) {
      this.movementsFacade.loadMovements();
    }
  }

  toggleExpand(uuid: string): void {
    if (this.expandedMovement === uuid) {
      this.expandedMovement = null;
    } else {
      this.expandedMovement = uuid;
    }
  }

  getActionColor(action: string): string {
    if (action.includes('post') || action.includes('create')) return 'success';
    if (action.includes('put') || action.includes('patch') || action.includes('update')) return 'warning';
    if (action.includes('delete')) return 'danger';
    return 'primary';
  }

  getMovementIcon(action: string): string {
    const act = action.toLowerCase();
    if (act.includes('order')) return 'cart-outline';
    if (act.includes('sale')) return 'cash-outline';
    if (act.includes('product')) return 'cube-outline';
    if (act.includes('user')) return 'people-outline';
    if (act.includes('family')) return 'folder-outline';
    if (act.includes('tax')) return 'receipt-outline';
    if (act.includes('table')) return 'restaurant-outline';
    
    if (act.includes('post')) return 'add-circle-outline';
    if (act.includes('put') || act.includes('patch')) return 'create-outline';
    if (act.includes('delete')) return 'trash-outline';
    
    return 'flash-outline';
  }

  getInitials(name: string | null): string {
    return this.utilsService.getInitials(name || 'Sistema');
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').toUpperCase();
  }
}
