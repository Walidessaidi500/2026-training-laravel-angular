import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, logOutOutline, fastFoodOutline, cartOutline } from 'ionicons/icons';
import { Table } from '@services/domain/table.service';

@Component({
  selector: 'app-pda-header',
  templateUrl: './pda-header.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PdaHeaderComponent {
  @Input() pdaViewState: 'tables' | 'order' | 'cart' = 'tables';
  @Input() selectedTable: Table | null = null;
  @Input() cartItemsCount: number = 0;
  @Input() restaurantName: string = '';
  @Input() workerName: string = '';

  @Output() back = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() viewStateChange = new EventEmitter<'order' | 'cart'>();

  constructor() {
    addIcons({ arrowBackOutline, logOutOutline, fastFoodOutline, cartOutline });
  }

  onBack() { this.back.emit(); }
  onLogout() { this.logout.emit(); }
  onSegmentChange(ev: any) { this.viewStateChange.emit(ev.detail.value); }
}
