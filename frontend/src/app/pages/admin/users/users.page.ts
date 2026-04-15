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
  AlertController,
  ToastController,
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
import { UserFormComponent, UserFormData } from '@components/user-form/user-form.component';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { DataListComponent } from '@components/data-list/data-list.component';

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
    PageHeaderComponent,
    DataListComponent,
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
    private alertController: AlertController,
    private toastController: ToastController
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

    if (!this.currentUser || (role !== 'admin' && role !== 'supervisor')) {
      this.isAdmin = false;
      this.isSupervisor = false;
      this.isLoading = false;
      return;
    }

    this.isAdmin = role === 'admin';
    this.isSupervisor = role === 'supervisor';
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
    this.userStats.total = this.users.length;
    this.userStats.admins = this.users.filter((u) => u.role.toLowerCase() === 'admin').length;
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  onRoleChange(event: any): void {
    this.selectedRole = event.detail.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.users;

    
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter((u) => u.role.toLowerCase() === this.selectedRole.toLowerCase());
    }

    
    if (this.searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(this.searchTerm) ||
          u.email.toLowerCase().includes(this.searchTerm)
      );
    }

    this.filteredUsers = filtered;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    const alert = await this.alertController.create({
      header: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar a <strong>${user.name}</strong>? Esta acción no se puede deshacer.`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Delete cancelled');
          },
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.performDeleteUser(user.uuid);
          },
        },
      ],
    });

    await alert.present();
  }

  private handleCreateUser(formData: UserFormData): void {
    this.userService.create(formData).subscribe({
      next: (response) => {
        this.showSuccessToast('Usuario creado exitosamente');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.showErrorToast('Error al crear el usuario');
      },
    });
  }

  private handleUpdateUser(uuid: string, formData: UserFormData): void {
    this.userService.update(uuid, formData).subscribe({
      next: (response) => {
        this.showSuccessToast('Usuario actualizado exitosamente');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.showErrorToast('Error al actualizar el usuario');
      },
    });
  }

  private performDeleteUser(uuid: string): void {
    this.userService.delete(uuid).subscribe({
      next: (response) => {
        this.showSuccessToast('Usuario eliminado exitosamente');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.showErrorToast('Error al eliminar el usuario');
      },
    });
  }

  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle',
    });
    await toast.present();
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle',
    });
    await toast.present();
  }
}
