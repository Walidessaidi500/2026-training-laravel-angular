import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { ZoneService } from '../../../../services/backoffice/zone.service';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-zone-form',
  templateUrl: './zone-form.component.html',
  styleUrls: ['./zone-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
    IonButtons, IonBackButton
  ]
})
export class ZoneFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly zoneService = inject(ZoneService);

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
      this.loadZone();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private loadZone() {
    if (!this.uuid) return;
    this.zoneService.getZone(this.uuid).subscribe(zone => {
      this.form.patchValue({
        name: zone.name
      });
    });
  }

  save() {
    if (this.form.invalid) return;

    if (this.isEdit && this.uuid) {
      this.zoneService.updateZone(this.uuid, this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/zones']);
      });
    } else {
      this.zoneService.createZone(this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/zones']);
      });
    }
  }
}

