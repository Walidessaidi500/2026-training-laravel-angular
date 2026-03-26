import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { BaseApiService } from '../../../services/api/base-api.service';
import type { LoginUserRequest, LoginUserResponse, ApiValidationError } from '../../../shared/models/user-api.models';
import { ToastController, IonButton, IonInput, IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/infrastructure/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, IonButton, IonInput, IonItem, IonLabel, IonNote, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(BaseApiService);
  private readonly toastController = inject(ToastController);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form!: FormGroup;
  submitting = false;
  formLevelMessage: string | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  getFieldError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !control.touched) return '';
    if (control.errors['required']) return 'El campo es requerido.';
    if (control.errors['email']) return 'Debe ser un email válido.';
    if (control.errors['serverError']) return control.errors['serverError'];
    return 'Campo inválido.';
  }

  onSubmit(): void {
    if (this.submitting) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.formLevelMessage = null;
    this.cdr.detectChanges();

    const payload: LoginUserRequest = {
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.api.httpCall('/login', payload, 'post').subscribe({
      next: async (res: any) => {
        const response = res.data ?? res;
        this.submitting = false;

        this.authService.setSession(response.token, response.user);

        const toast = await this.toastController.create({
          message: '¡Login exitoso! Redirigiendo...',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        this.cdr.detectChanges();

        this.router.navigate(['/backoffice']); // Redirigimos al backoffice tras login exitoso
      },
      error: async (err: any) => {
        this.submitting = false;
        const apiError = err.error as ApiValidationError | undefined;
        const validationErrors = apiError?.errors ?? apiError?.fieldErrors;

        if (validationErrors && Object.keys(validationErrors).length > 0) {
          for (const [field, messages] of Object.entries(validationErrors)) {
            const control = this.form.get(field);
            const firstMessage = Array.isArray(messages) ? messages[0] : String(messages);
            if (control && firstMessage) {
              control.setErrors({
                ...(control.errors ?? {}),
                serverError: firstMessage,
              });
            }
          }
          this.formLevelMessage = apiError?.message ?? Object.values(validationErrors).reduce((acc: string[], val: string[]) => acc.concat(val), []).find(Boolean) ?? '';
        } else {
          this.formLevelMessage = apiError?.message ?? err.message ?? 'Error de credenciales.';
          const toast = await this.toastController.create({
            message: this.formLevelMessage ?? 'Error de credenciales.',
            duration: 5000,
            position: 'bottom',
            color: 'danger',
            buttons: [{ text: 'Cerrar', role: 'cancel' }]
          });
          await toast.present();
        }
        this.cdr.detectChanges();
      }
    });
  }
}
