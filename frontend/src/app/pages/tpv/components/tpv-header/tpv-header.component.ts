import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Table } from '@services/domain/table.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline, personCircleOutline, chevronDownOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-header',
  templateUrl: './tpv-header.component.html',
  styleUrls: ['./tpv-header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TpvHeaderComponent {
  @Input() viewState: 'tables' | 'order' = 'tables';
  @Input() selectedTable: Table | null = null;
  @Input() currentUser: any = null;

  @Output() back = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  constructor() {
    addIcons({ arrowBackOutline, personCircleOutline, chevronDownOutline, logOutOutline });
  }

  onBack() {
    this.back.emit();
  }

  onLogout() {
    this.logout.emit();
  }
}
