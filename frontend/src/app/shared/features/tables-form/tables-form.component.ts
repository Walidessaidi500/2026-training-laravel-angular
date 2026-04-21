import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { Zone } from '@services/domain/zone.service';
import { Table } from '@services/domain/table.service';

@Component({
  selector: 'app-tables-form',
  templateUrl: './tables-form.component.html',
  styleUrls: ['./tables-form.component.scss'],
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
    IonSpinner,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TablesFormComponent implements OnInit {
  @Input() table: Table | null = null;
  @Input() zones: Zone[] = [];

  public tableForm!: FormGroup;
  public isEditMode = false;
  public isLoading = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    addIcons({ saveOutline, closeOutline });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.table;
    this.initForm();
  }

  private initForm(): void {
    this.tableForm = this.fb.group({
      name: [this.table?.name || '', [Validators.required, Validators.minLength(2)]],
      zone_id: [this.table?.zone_id || '', [Validators.required]]
    });
  }

  public dismiss(): void {
    this.modalCtrl.dismiss();
  }

  public submit(): void {
    if (this.tableForm.valid) {
      this.modalCtrl.dismiss(this.tableForm.value);
    } else {
      Object.values(this.tableForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  public getFieldError(field: string): string | null {
    const control = this.tableForm.get(field);
    if (control?.touched && control.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['minlength']) return 'Debe tener al menos 2 caracteres';
    }
    return null;
  }
}
