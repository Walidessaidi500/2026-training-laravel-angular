import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonIcon, 
  IonBadge, IonSearchbar, IonButtons
} from '@ionic/angular/standalone';
import { FamilyService, Family } from '../../../../services/backoffice/family.service';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, eyeOffOutline, eyeOutline, pricetagsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-family-list',
  templateUrl: './family-list.component.html',
  styleUrls: ['./family-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonButton, IonIcon, 
    IonBadge, IonSearchbar, IonButtons
  ]
})
export class FamilyListComponent implements OnInit {
  private readonly familyService = inject(FamilyService);
  
  families: Family[] = [];
  filteredFamilies: Family[] = [];

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, eyeOffOutline, eyeOutline, pricetagsOutline });
  }

  ngOnInit() {
    this.loadFamilies();
  }

  loadFamilies() {
    this.familyService.getFamilies().subscribe(data => {
      this.families = data;
      this.filteredFamilies = data;
    });
  }

  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.filteredFamilies = this.families.filter(f => f.name.toLowerCase().includes(query));
  }

  toggleActive(family: Family) {
    this.familyService.toggleActive(family.uuid).subscribe(() => {
      family.active = !family.active;
    });
  }

  deleteFamily(uuid: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta familia?')) {
      this.familyService.deleteFamily(uuid).subscribe(() => {
        this.loadFamilies();
      });
    }
  }
}

