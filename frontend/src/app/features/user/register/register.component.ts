import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BaseApiService } from '../../../services/api/base-api.service';
import type { CreateUserRequest, ApiValidationError } from '../../../shared/models/user-api.models';
import { ToastController, IonButton, IonInput, IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, IonButton, IonInput, IonItem, IonLabel, IonNote],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(BaseApiService);
  private readonly toastController = inject(ToastController);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  protected submitting = false;
  protected formLevelMessage = '';

  private passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmation = group.get('password_confirmation')?.value;
    return password && confirmation && password !== confirmation
      ? { passwordMismatch: true }
      : null;
  }

  /** Mensaje de error a mostrar en el campo: passwordMismatch a nivel grupo, resto vía control (incl. serverError). */
  protected getFieldError(field: string): string {
    const password = this.form.get('password')?.value ?? '';
    const confirmation = this.form.get('password_confirmation')?.value ?? '';
    if (
      (field === 'password' || field === 'password_confirmation') &&
      password !== '' &&
      confirmation !== '' &&
      password !== confirmation
    ) {
      return 'Las contraseñas no coinciden.';
    }
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return '';
    if (control.errors['required']) return 'El campo es requerido.';
    if (control.errors['email']) return 'Debe ser un email válido.';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.errors['serverError']) return control.errors['serverError'];
    return 'Campo inválido.';
  }

  private clearServerErrors(): void {
    for (const key of ['name', 'email', 'password', 'password_confirmation']) {
      const control = this.form.get(key);
      const errors = control?.errors;
      if (errors && 'serverError' in errors) {
        const { serverError: _, ...rest } = errors;
        control!.setErrors(Object.keys(rest).length > 0 ? rest : null);
      }
    }
  }

  protected onSubmit(): void {
    this.formLevelMessage = '';
    this.clearServerErrors();
    if (this.submitting) {
      return;
    }
    this.form.updateValueAndValidity();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.detectChanges();
      return;
    }
    const value = this.form.getRawValue() as CreateUserRequest;
    this.submitting = true;
    this.api.httpCall('/register', value, 'post').subscribe({
      next: async () => {
        this.submitting = false;
        this.form.reset();
        this.formLevelMessage = '';
        const toast = await this.toastController.create({
          message: 'Usuario registrado correctamente.',
          duration: 5000,
          position: 'bottom',
          buttons: [{ text: 'Cerrar', role: 'cancel' }]
        });
        await toast.present();
      },
      error: async (err: any) => {
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
          this.form.markAllAsTouched();
          this.formLevelMessage =
            apiError.message ??
            Object.values(apiError.fieldErrors).reduce((acc: string[], val: string[]) => acc.concat(val), []).find(Boolean) ??
            '';
        } else {
          this.formLevelMessage = apiError?.message ?? err.message ?? 'Error al registrar.';
          const toast = await this.toastController.create({
            message: this.formLevelMessage,
            duration: 5000,
            position: 'bottom',
            buttons: [{ text: 'Cerrar', role: 'cancel' }]
          });
          await toast.present();
        }
        this.cdr.detectChanges();
      },
    });
  }
}
