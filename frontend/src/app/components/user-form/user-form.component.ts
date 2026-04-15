import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonText,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
  password_confirmation?: string;
  pin?: string;
}

export interface UserFormModel {
  uuid?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  pin?: string;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonText,
    IonSpinner,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserFormComponent implements OnInit {
  @Input() user: UserFormModel | null = null;
  @Input() isLoading = false;

  @Output() onSubmit = new EventEmitter<UserFormData>();
  @Output() onCancel = new EventEmitter<void>();

  userForm!: FormGroup;
  isEditMode = false;

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'operator', label: 'Operador' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.user?.uuid;
    this.initializeForm();

    if (this.isEditMode && this.user) {
      this.populateForm(this.user);
    }
  }

  private initializeForm(): void {
    const passwordValidators = this.isEditMode 
      ? [Validators.minLength(8)]
      : [Validators.required, Validators.minLength(8)];

    this.userForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['operator', Validators.required],
        pin: ['', [Validators.maxLength(10)]],
        password: ['', passwordValidators],
        password_confirmation: ['', passwordValidators],
      },
      { validators: this.passwordMatchValidator() }
    );
  }

  private passwordMatchValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const passwordConfirmation = control.get('password_confirmation');


      if (!password?.value && !passwordConfirmation?.value) {
        return null;
      }


      if (password?.value && !passwordConfirmation?.value) {
        passwordConfirmation?.setErrors({ required: true });
        return { passwordMismatch: true };
      }


      if (password?.value !== passwordConfirmation?.value) {
        passwordConfirmation?.setErrors({ mismatch: true });
        return { passwordMismatch: true };
      }


      passwordConfirmation?.setErrors(null);
      return null;
    };
  }

  private populateForm(user: UserFormModel): void {
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      pin: user.pin || '',
    });
  }

  submit(): void {
    if (this.userForm.valid) {
      const formData: UserFormData = this.userForm.value;
      

      if (this.isEditMode) {
        if (!formData.password) {
          delete formData.password;
        }
        if (!formData.password_confirmation) {
          delete formData.password_confirmation;
        }
      }
      
      this.onSubmit.emit(formData);
      this.modalController.dismiss(formData);
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  cancel(): void {
    this.onCancel.emit();

    this.modalController.dismiss(null);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.userForm.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return null;
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }

    if (fieldName === 'email' && control.errors['email']) {
      return 'Ingresa un email válido';
    }

    if (fieldName === 'name' && control.errors['minlength']) {
      return 'El nombre debe tener al menos 3 caracteres';
    }

    if ((fieldName === 'password' || fieldName === 'password_confirmation') && control.errors['minlength']) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (fieldName === 'pin' && control.errors['maxlength']) {
      return 'El PIN no puede exceder 10 caracteres';
    }

    if (fieldName === 'password_confirmation' && control.errors['mismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      email: 'Email',
      role: 'Rol',
      pin: 'PIN',
      password: 'Contraseña',
      password_confirmation: 'Confirmar Contraseña',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
