import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface AlertItem {
  type: 'success' | 'danger' | 'warning' | string;
  title: string;
  description: string;
  timeAgo: string;
}

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './alert-list.component.html',
  styleUrls: ['./alert-list.component.scss']
})
export class AlertListComponent {
  @Input() alerts: AlertItem[] = [];
  @Input() label: string = 'ALERTAS';
}
