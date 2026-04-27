import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonItem, IonInput, IonButton, 
  IonSpinner, IonIcon
} from '@ionic/angular/standalone';
import { AuthService, LoginRequest } from '@services/auth/auth.service';

// Importación de iconos (Crucial para Ionic Standalone)
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,  
  imports: [ 
    CommonModule, ReactiveFormsModule, 
    IonContent, IonItem, IonInput, IonButton, IonSpinner, IonIcon
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false; // Estado para el ojito

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Registramos los iconos que usamos en el HTML
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Getters para el HTML
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // Función para el botón del ojito
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        const user = this.authService.getUser();
        
        switch (user?.role) {
          case 'supervisor':
            this.router.navigate(['/supervisor/dashboard']);
            break;
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          default:
            // restaurant y otros roles van al TPV
            this.router.navigate(['/employee/tpv']);
            break;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Credenciales incorrectas. Intenta nuevamente.';
      },
    });
  }
}