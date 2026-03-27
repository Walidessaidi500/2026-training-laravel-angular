import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonButtons, IonBackButton, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { TableService, ZoneService, Zone } from '../../../../services/backoffice/zone.service';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-table-form',
  templateUrl: './table-form.component.html',
  styleUrls: ['./table-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
    IonButtons, IonBackButton, IonSelect, IonSelectOption
  ]
})
export class TableFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tableService = inject(TableService);
  private readonly zoneService = inject(ZoneService);

  form!: FormGroup;
  isEdit = false;
  uuid?: string;
  zones: Zone[] = [];

  constructor() {
    addIcons({ saveOutline });
    this.initForm();
  }

  ngOnInit() {
    this.loadZones();
    this.uuid = this.route.snapshot.params['uuid'];
    if (this.uuid) {
      this.isEdit = true;
      this.loadTable();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      zoneUuid: ['', [Validators.required]]
    });
  }

  private loadZones() {
    this.zoneService.getZones().subscribe(data => this.zones = data);
  }

  private loadTable() {
    if (!this.uuid) return;
    this.tableService.getTable(this.uuid).subscribe(table => {
      this.form.patchValue({
        name: table.name,
        zoneUuid: table.zoneUuid
      });
    });
  }

  save() {
    if (this.form.invalid) return;

    if (this.isEdit && this.uuid) {
      this.tableService.updateTable(this.uuid, this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/tables']);
      });
    } else {
      this.tableService.createTable(this.form.value).subscribe(() => {
        this.router.navigate(['/backoffice/tables']);
      });
    }
  }
}

