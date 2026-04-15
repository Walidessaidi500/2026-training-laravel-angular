import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  ToastController, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonContent, 
  IonAvatar, 
  IonButton, 
  IonList, 
  IonItem, 
  IonInput, 
  IonNote, 
  IonIcon, 
  IonToggle 
} from '@ionic/angular/standalone';
import { AuthService, User } from '@services/auth/auth.service';
import { UserService } from '@services/domain/user.service';
import { addIcons } from 'ionicons';
import { contrastOutline, textOutline, volumeHighOutline, settingsOutline, createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonSegment, 
    IonSegmentButton, 
    IonLabel, 
    IonContent, 
    IonAvatar, 
    IonButton, 
    IonList, 
    IonItem, 
    IonInput, 
    IonNote, 
    IonIcon, 
    IonToggle
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsComponent implements OnInit {

  
  selectedTab: string = 'account';

  
  accountForm!: FormGroup;

  
  userProfile = {
    avatarUrl: 'assets/images/default-avatar.png',
    email: ''
  };

  accessibilitySettings = {
    darkMode: false,
    largeText: false,
    screenReader: false
  };

  currentUser: User | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  constructor() { 
    addIcons({
      'contrast-outline': contrastOutline,
      'text-outline': textOutline,
      'volume-high-outline': volumeHighOutline,
      'settings-outline': settingsOutline,
      'create-outline': createOutline
    });
  }

  ngOnInit() {
    this.initForm();
    this.loadCurrentUserData();
    
    
    const prefs = localStorage.getItem('accessibilityPrefs');
    if (prefs) {
      try {
        this.accessibilitySettings = JSON.parse(prefs);
        if (this.accessibilitySettings.darkMode) {
          document.body.classList.add('dark');
        }
      } catch(e) {}
    }
  }

  private initForm() {
    this.accountForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(8)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (newPassword && newPassword !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadCurrentUserData() {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.userProfile.email = this.currentUser.email;
      this.accountForm.patchValue({
        email: this.userProfile.email
      });
    }
  }

  

  public updateAccountSettings() {
    if (this.accountForm.invalid || !this.currentUser) return;

    const controls = this.accountForm.controls;
    const email = controls['email'].value;
    const currentPassword = controls['currentPassword'].value;
    const newPassword = controls['newPassword'].value;

    const updates: any = {};
    
    if (controls['email'].dirty && email !== this.userProfile.email) {
      updates.email = email;
    }
    
    if (controls['newPassword'].dirty && newPassword) {
      if (!currentPassword) {
        this.presentToast('Debes introducir tu contraseña actual para cambiarla.', 'warning');
        return;
      }
      updates.current_password = currentPassword;
      updates.password = newPassword;
    }

    if (Object.keys(updates).length > 0) {
      this.userService.update(this.currentUser.uuid, updates).subscribe({
        next: () => {
          this.presentToast('Cuenta actualizada con éxito.');
          this.userProfile.email = email;
          this.accountForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          this.accountForm.markAsPristine();
        },
        error: (err) => {
          const message = err.error?.message || 'Error al actualizar cuenta.';
          this.presentToast(message, 'danger');
        }
      });
    }
  }

  public onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      
      const reader = new FileReader();
      reader.onload = () => {
        this.userProfile.avatarUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      
      
      this.presentToast('Imagen de perfil actualizada localmente (necesita API).');
    }
  }

  

  public toggleAccessibility() {
    if (this.accessibilitySettings.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    
    localStorage.setItem('accessibilityPrefs', JSON.stringify(this.accessibilitySettings));
  }

  

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}