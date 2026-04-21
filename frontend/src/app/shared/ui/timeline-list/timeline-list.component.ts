import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface TimelineItem {
  icon: string;
  type: string;
  title: string;
  description: string;
  timeAgo: string;
}

@Component({
  selector: 'app-timeline-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './timeline-list.component.html',
  styleUrls: ['./timeline-list.component.scss']
})
export class TimelineListComponent {
  @Input() items: TimelineItem[] = [];
  @Input() title: string = 'ACTUALIZACIONES EN DIRECTO';
  @Input() label: string = 'CENTRO DE ACTIVIDAD';
}
