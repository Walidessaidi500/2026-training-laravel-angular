import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { AuthService } from '@services/auth/auth.service';
import { UserService } from '@services/domain/user.service';
import { UiService } from '@services/ui.service';
import { FilterService } from '@services/filter.service';
import { UtilsService } from '@services/utils.service';
import { CrudHelperService } from '@services/crud-helper.service';
import { UserFormComponent, UserFormData } from '@components/user-form/user-form.component';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';


interface User {
  uuid: string;
  name: string;
  email: string;
  role: string;
  restaurant_id?: number;
  status?: string;
  pin?: string;
  created_at?: string;
}

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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsersPage implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  isSupervisor = false;
  isLoading = true;

  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  selectedRole = 'all';

  userStats = {
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
  };

  roleColors: { [key: string]: string } = {
    admin: 'danger',
    customer: 'success',
    staff: 'warning',
    operator: 'warning',
    supervisor: 'tertiary',
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private modalController: ModalController,
    private uiService: UiService,
    private filterService: FilterService,
    private utilsService: UtilsService,
    private crudHelper: CrudHelperService
  ) {
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
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    const role = this.currentUser?.role?.toLowerCase();

    if (!this.currentUser || (!this.authService.hasRole('admin') && !this.authService.hasRole('supervisor'))) {
      this.isAdmin = false;
      this.isSupervisor = false;
      this.isLoading = false;
      return;
    }

    this.isAdmin = this.authService.hasRole('admin');
    this.isSupervisor = this.authService.hasRole('supervisor');
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userService.list().subscribe({
      next: (response: any) => {
        let allUsers = response.data || response || [];
        
        
        if (this.isSupervisor) {
          allUsers = allUsers.filter((u: User) => u.role.toLowerCase() !== 'admin');
        }

        this.users = allUsers;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      },
    });
  }

  private calculateStats(): void {
    const stats = this.utilsService.calculateStats(this.users, [
      { label: 'admins', filterFn: (u) => u.role.toLowerCase() === 'admin' },
    ]);
    this.userStats = {
      total: stats['total'],
      active: 0,
      inactive: 0,
      admins: stats['admins'],
    };
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  onRoleChange(event: any): void {
    this.selectedRole = event.detail.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredUsers = this.filterService.applyFilters(this.users, {
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
    return this.roleColors[role] || 'medium';
  }

  async addNewUser(): Promise<void> {
    const modal = await this.modalController.create({
      component: UserFormComponent,
      componentProps: {
        user: null,
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.handleCreateUser(data);
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
          status: user.status,
          pin: user.pin,
        },
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.handleUpdateUser(user.uuid, data);
    }
  }

  async deleteUser(user: User): Promise<void> {
    await this.uiService.confirmDelete(
      'Eliminar Usuario',
      `¿Estás seguro de que deseas eliminar a <strong>${user.name}</strong>? Esta acción no se puede deshacer.`,
      () => this.performDeleteUser(user.uuid)
    );
  }

  private handleCreateUser(formData: UserFormData): void {
    this.crudHelper.handleCreate(
      this.userService.create(formData),
      'Usuario creado exitosamente',
      () => this.loadUsers()
    );
  }

  private handleUpdateUser(uuid: string, formData: UserFormData): void {
    this.crudHelper.handleUpdate(
      this.userService.update(uuid, formData),
      'Usuario actualizado exitosamente',
      () => this.loadUsers()
    );
  }

  private performDeleteUser(uuid: string): void {
    this.crudHelper.handleDelete(
      this.userService.delete(uuid),
      'Usuario eliminado exitosamente',
      () => this.loadUsers()
    );
  }
}

