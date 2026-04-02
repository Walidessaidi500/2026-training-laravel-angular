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

  productForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
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
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData: ProductFormData = {
        name: this.productForm.value.name.trim(),
        priceInCents: Math.round(Number(this.productForm.value.price) * 100),
        stock: Number(this.productForm.value.stock),
        family_id: this.productForm.value.family_id,
        tax_id: this.productForm.value.tax_id,
        active: Boolean(this.productForm.get('active')?.value)
      };

      this.modalCtrl.dismiss(formData);
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  get f() { return this.productForm.controls; }
}