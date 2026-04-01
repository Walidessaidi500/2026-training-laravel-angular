import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonInput, IonToggle, IonButton, IonButtons,
  IonIcon, IonNote, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, saveOutline } from 'ionicons/icons';

export interface FamilyFormData {
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-families-form',
  templateUrl: './families-form.component.html',
  styleUrls: ['./families-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonLabel, IonInput, IonToggle, IonButton,
    IonButtons, IonIcon, IonNote
  ]
})
export class FamilyFormComponent implements OnInit {
  @Input() family: any = null;

  familyForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    addIcons({ 'close-outline': closeOutline, 'save-outline': saveOutline });

    this.familyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [true]
    });
  }

  ngOnInit() {
    if (this.family) {
      this.isEditMode = true;
      this.familyForm.patchValue({
        name: this.family.name,
        active: this.family.active ?? true
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }

  onSubmit() {
    if (this.familyForm.valid) {
      const formData: FamilyFormData = {
        name: this.familyForm.value.name.trim(),
        active: this.familyForm.value.active
      };
      this.modalCtrl.dismiss(formData);
    } else {
      this.familyForm.markAllAsTouched();
    }
  }

  get f() { return this.familyForm.controls; }
}