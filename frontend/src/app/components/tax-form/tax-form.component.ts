import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonButton,
  IonButtons,
  IonIcon,
  IonNote,
  ModalController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { closeOutline, saveOutline } from 'ionicons/icons';

export interface TaxFormData {
  name: string;
  rate: number;
  active: boolean;
}

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonButton,
    IonButtons,
    IonIcon,
    IonNote
  ]
})
export class TaxFormComponent implements OnInit {
  @Input() tax: any = null;

  taxForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    addIcons({
      'close-outline': closeOutline,
      'save-outline': saveOutline
    });

    this.taxForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      rate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      active: [true]
    });
  }

  ngOnInit() {
    if (this.tax) {
      this.isEditMode = true;
      this.taxForm.patchValue({
        name: this.tax.name,
        rate: this.tax.rate,
        active: this.tax.active ?? true
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }

  onSubmit() {
    if (this.taxForm.valid) {
      const formData: TaxFormData = {
        name: this.taxForm.value.name.trim(),
        rate: Number(this.taxForm.value.rate),
        active: this.taxForm.value.active
      };

      this.modalCtrl.dismiss(formData);
    } else {
      this.taxForm.markAllAsTouched();
    }
  }

  get f() { return this.taxForm.controls; }
}
