import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
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
  IonSegment,
  IonSegmentButton,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  addOutline,
  people,
  shield,
  createOutline,
  trashOutline,
  checkmarkCircle,
  alertCircle,
  personOutline
} from 'ionicons/icons';

// Facades
import { UsersFacade } from '@app/core/facades/users.facade';

// Services
import { AuthService } from '@services/auth/auth.service';
import { UiService } from '@app/core/services/ui/ui.service';
import { FilterService } from '@app/core/services/helper/filter.service';
import { UtilsService } from '@app/core/services/helper/utils.service';

// Components
import { UserFormComponent, UserFormData } from '@components/user-form/user-form.component';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { PageHeaderComponent } from '@app/shared/ui/page-header/page-header.component';

// Types
import { User } from '@services/domain/user.service';
import { combineLatest, map, Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
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
    IonSegment,
    IonSegmentButton,
    AccessDeniedComponent,
    PageHeaderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsersPage implements OnInit {
  private readonly usersFacade = inject(UsersFacade);
  private readonly authService = inject(AuthService);
  private readonly modalController = inject(ModalController);
  private readonly uiService = inject(UiService);
  private readonly filterService = inject(FilterService);
  private readonly utilsService = inject(UtilsService);

  // State Observables
  public readonly users$ = this.usersFacade.users$;
  public readonly isLoading$ = this.usersFacade.isLoading$;
  
  // Combined State
  public filteredUsers$: Observable<User[]>;
  public userStats$: Observable<any>;

  // UI State
  public currentUser: any = null;
  public isAdmin = false;
  public isSupervisor = false;
  public searchTerm = '';
  public selectedRole = 'all';

  private readonly roleColors: { [key: string]: string } = {
    admin: 'danger',
    customer: 'success',
    staff: 'warning',
    operator: 'warning',
    supervisor: 'tertiary',
  };

  constructor() {
    addIcons({
      'people-outline': peopleOutline,
      'add-outline': addOutline,
      'people': people,
      'shield': shield,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'alert-circle': alertCircle,
      'person-outline': personOutline,
    });

    // Initialize filtered users stream
    this.filteredUsers$ = this.users$.pipe(
      map(users => {
        let allUsers = [...users];
        if (this.isSupervisor) {
          allUsers = allUsers.filter(u => u.role.toLowerCase() !== 'admin');
        }
        return this.applyFilters(allUsers);
      })
    );

    // Initialize stats stream
    this.userStats$ = this.users$.pipe(
      map(users => {
        const stats = this.utilsService.calculateStats(users, [
          { label: 'admins', filterFn: (u) => u.role.toLowerCase() === 'admin' },
        ]);
        return {
          total: stats['total'],
          active: 0,
          inactive: 0,
          admins: stats['admins'],
        };
      })
    );
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    if (!this.currentUser || (!this.authService.hasRole('admin') && !this.authService.hasRole('supervisor'))) {
      this.isAdmin = false;
      this.isSupervisor = false;
      return;
    }

    this.isAdmin = this.authService.hasRole('admin');
    this.isSupervisor = this.authService.hasRole('supervisor');
    this.usersFacade.loadUsers(1, 100);
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.refreshFilters();
  }

  onRoleChange(event: any): void {
    this.selectedRole = event.detail.value;
    this.refreshFilters();
  }

  private refreshFilters(): void {
    this.filteredUsers$ = this.users$.pipe(
      map(users => {
        let allUsers = [...users];
        if (this.isSupervisor) {
          allUsers = allUsers.filter(u => u.role.toLowerCase() !== 'admin');
        }
        return this.applyFilters(allUsers);
      })
    );
  }

  private applyFilters(users: User[]): User[] {
    return this.filterService.applyFilters(users, {
      searchTerm: this.searchTerm,
      searchProperties: ['name', 'email'],
      propertyFilters: [
        { property: 'role', value: this.selectedRole }
      ]
    });
  }

  getInitials(name: string): string {
    return this.utilsService.getInitials(name);
  }

  getRoleBadgeClass(role: string): string {
    return this.roleColors[role.toLowerCase()] || 'medium';
  }

  async addNewUser(): Promise<void> {
    const modal = await this.modalController.create({
      component: UserFormComponent,
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<UserFormData>();

    if (data) {
      this.usersFacade.createUser(data).subscribe({
        next: () => this.uiService.showSuccess('Usuario creado exitosamente'),
        error: (err) => this.uiService.showError('Error al crear usuario: ' + (err.error?.message || 'Error desconocido'))
      });
    }
  }

  async editUser(user: User): Promise<void> {
    const modal = await this.modalController.create({
      component: UserFormComponent,
      componentProps: {
        user: {
          uuid: user.uuid,
          name: user.name,
          email: user.email,
          role: user.role,
          pin: user.pin,
        },
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<UserFormData>();

    if (data) {
      this.usersFacade.updateUser(user.uuid, data).subscribe({
        next: () => this.uiService.showSuccess('Usuario actualizado exitosamente'),
        error: () => this.uiService.showError('Error al actualizar usuario')
      });
    }
  }

  async deleteUser(user: User): Promise<void> {
    await this.uiService.confirmDelete(
      'Eliminar Usuario',
      `¿Estás seguro de que deseas eliminar a <strong>${user.name}</strong>?`,
      () => {
        this.usersFacade.deleteUser(user.uuid).subscribe({
          next: () => this.uiService.showSuccess('Usuario eliminado exitosamente'),
          error: () => this.uiService.showError('Error al eliminar usuario')
        });
      }
    );
  }
}
