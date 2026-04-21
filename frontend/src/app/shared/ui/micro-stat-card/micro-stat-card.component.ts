import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-micro-stat-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './micro-stat-card.component.html',
  styleUrls: ['./micro-stat-card.component.scss']
})
export class MicroStatCardComponent {
  @Input() icon: string = 'pie-chart';
  @Input() iconColor: string = 'primary';
  @Input() trendPercentage: number | string | null = 0;
  @Input() trendType: 'success' | 'danger' | 'warning' | string = 'success';
  @Input() value: number | string | null = 0;
  @Input() label: string = '';
}
