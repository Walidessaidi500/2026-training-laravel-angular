import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonIcon],
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '0';
  @Input() icon: string = '';
  @Input() color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' = 'primary';
}
