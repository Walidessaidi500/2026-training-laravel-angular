import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonToggle, IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { FamilyService } from '../../../../services/backoffice/family.service';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-family-form',
  templateUrl: './family-form.component.html',
  styleUrls: ['./family-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
    IonToggle, IonButtons, IonBackButton
  ]
})
export class FamilyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly familyService = inject(FamilyService);

  form!: FormGroup;
  isEdit = false;
  uuid?: string;

  constructor() {
    addIcons({ saveOutline });
    this.initForm();
  }

  ngOnInit() {
    this.uuid = this.route.snapshot.params['uuid'];
    if (this.uuid) {
      this.isEdit = true;
      this.loadFamily();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      active: [true]
    });
  }

  private loadFamily() {
    if (!this.uuid) return;
    this.familyService.getFamily(this.uuid).subscribe(family => {
      this.form.patchValue({
        name: family.name,
        active: family.active
      });
    });
  }

  save() {
    if (this.form.invalid) return;

    if (this.isEdit && this.uuid) {
      this.familyService.updateFamily(this.uuid, this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/families']);
      });
    } else {
      this.familyService.createFamily(this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/families']);
      });
    }
  }
}

