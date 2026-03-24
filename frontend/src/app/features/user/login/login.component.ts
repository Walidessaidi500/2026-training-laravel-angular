import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiClientService } from '../../../core/infrastructure/api/api-client.service';
import { ValidationMessagesService } from '../../../core/validation/validation-messages.service';
import type { ApiValidationError } from '../../../shared/models/api-error.models';
import type { LoginUserRequest, LoginUserResponse } from '../../../shared/models/user-api.models';
import { ToastController, IonButton, IonInput, IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/infrastructure/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, IonButton, IonInput, IonItem, IonLabel, IonNote],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiClientService);
  private readonly validationMessages = inject(ValidationMessagesService);
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
    return this.validationMessages.getControlMessage(this.form.get(controlName), controlName);
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

    this.api.post<LoginUserResponse>('/login', payload).subscribe({
      next: async (response) => {
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

        this.router.navigate(['/']); // De momento lo redirigimos a la raíz o al main-layout
      },
      error: (err) => {
        this.submitting = false;
        const apiError = err.error as ApiValidationError | undefined;

        if (apiError?.fieldErrors && Object.keys(apiError.fieldErrors).length > 0) {
          for (const [field, messages] of Object.entries(apiError.fieldErrors)) {
            const control = this.form.get(field);
            const firstMessage = Array.isArray(messages) ? messages[0] : String(messages);
            if (control && firstMessage) {
              control.setErrors({
                ...(control.errors ?? {}),
                serverError: firstMessage,
              });
            }
          }
          this.formLevelMessage = apiError.message ?? Object.values(apiError.fieldErrors).flat().find(Boolean) ?? '';
        } else {
          this.formLevelMessage = apiError?.message ?? err.message ?? 'Error de credenciales.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
