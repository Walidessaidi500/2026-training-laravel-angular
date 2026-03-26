import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon, IonSegment, 
  IonSegmentButton, IonLabel 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

import { ButtonComponent } from '../../../components/ui/button/button.component';
import { CardComponent } from '../../../components/ui/card/card.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButtons, IonIcon, IonSegment, 
    IonSegmentButton, IonLabel,
    ButtonComponent, CardComponent
  ],
})
export class HomePage {
  constructor() {
    addIcons({ personCircleOutline });
  }
}
