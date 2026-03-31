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
} from '@ionic/angular/standalone';
import { AuthService } from '@services/auth/auth.service';
import { UserService } from '@services/domain/user.service';

interface User {
  uuid: string;
  name: string;
  email: string;
  role: string;
  restaurant_id?: number;
  status?: string;
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsersPage implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
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
  };

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.isAdmin = false;
      this.isLoading = false;
      return;
    }

    this.isAdmin = true;
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userService.list().subscribe({
      next: (response: any) => {
        this.users = response.data || response || [];
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
    this.userStats.admins = this.users.filter((u) => u.role === 'admin').length;
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

    // Filter by role
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter((u) => u.role === this.selectedRole);
    }

    // Filter by search term
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

  editUser(user: User): void {
    console.log('Edit user:', user);
    // Implementar navegación a página de edición
  }

  deleteUser(user: User): void {
    console.log('Delete user:', user);
    // Implementar eliminación con confirmación
  }

  addNewUser(): void {
    console.log('Add new user');
    // Implementar navegación a página de crear usuario
  }
}
