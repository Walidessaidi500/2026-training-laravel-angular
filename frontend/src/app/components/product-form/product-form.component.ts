import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonInput, IonToggle, IonButton, IonButtons,
  IonIcon, IonNote, IonSelect, IonSelectOption, ModalController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { closeOutline, saveOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth/auth.service';

export interface ProductFormData {
  name: string;
  priceInCents: number;
  stock: number;
  family_id: string;
  tax_id: string;
  active: boolean;
}

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonLabel, IonInput, IonToggle, IonButton,
    IonButtons, IonIcon, IonNote, IonSelect, IonSelectOption
  ]
})
export class ProductFormComponent implements OnInit {
  @Input() product: any = null;
  @Input() families: any[] = [];
  @Input() taxes: any[] = [];

  isAdmin = false;
  isSupervisor = false;
  productForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {
    const user = this.authService.getUser();
    this.isAdmin = user?.role === 'admin';
    this.isSupervisor = user?.role === 'supervisor';

    addIcons({
      'close-outline': closeOutline,
      'save-outline': saveOutline
    });

    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      family_id: ['', [Validators.required]],
      tax_id: ['', [Validators.required]],
      active: [true]
    });
  }

  ngOnInit() {
    if (this.product) {
      this.isEditMode = true;
      this.productForm.patchValue({
        name: this.product.name,
        price: this.product.priceInCents / 100,
        stock: this.product.stock,
        family_id: this.product.family_id,
        tax_id: this.product.tax_id,
        active: this.product.active ?? true
      });

      
      if (this.isSupervisor) {
        this.productForm.get('price')?.disable();
        this.productForm.get('family_id')?.disable();
        this.productForm.get('tax_id')?.disable();
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }

  onSubmit() {
    if (this.productForm.valid) {
      const rawValues = this.productForm.getRawValue();
      const formData: ProductFormData = {
        name: rawValues.name.trim(),
        priceInCents: Math.round(Number(rawValues.price) * 100),
        stock: Number(rawValues.stock),
        family_id: rawValues.family_id,
        tax_id: rawValues.tax_id,
        active: Boolean(this.productForm.get('active')?.value)
      };

      this.modalCtrl.dismiss(formData);
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  get f() { return this.productForm.controls; }
}