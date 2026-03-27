import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { TaxService } from '../../../../services/backoffice/tax.service';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
    IonButtons, IonBackButton
  ]
})
export class TaxFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taxService = inject(TaxService);

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
      this.loadTax();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  private loadTax() {
    if (!this.uuid) return;
    this.taxService.getTax(this.uuid).subscribe(tax => {
      this.form.patchValue({
        name: tax.name,
        percentage: tax.percentage
      });
    });
  }

  save() {
    if (this.form.invalid) return;

    if (this.isEdit && this.uuid) {
      this.taxService.updateTax(this.uuid, this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/taxes']);
      });
    } else {
      this.taxService.createTax(this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/taxes']);
      });
    }
  }
}

