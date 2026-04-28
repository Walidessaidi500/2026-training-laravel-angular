import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Zone } from '@services/domain/zone.service';
import { Table } from '@services/domain/table.service';
import { addIcons } from 'ionicons';
import { gridOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-table-selection',
  templateUrl: './tpv-table-selection.component.html',
  styleUrls: ['./tpv-table-selection.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TpvTableSelectionComponent {
  @Input() zones: Zone[] = [];
  @Input() selectedZoneUuid: string | null = null;
  @Input() filteredTables: Table[] = [];
  @Input() tableOrders: { [tableUuid: string]: boolean } = {};

  @Output() zoneSelect = new EventEmitter<string>();
  @Output() tableClick = new EventEmitter<Table>();

  constructor() {
    addIcons({ gridOutline });
  }

  selectZone(uuid: string) {
    this.zoneSelect.emit(uuid);
  }

  onTableClick(table: Table) {
    this.tableClick.emit(table);
  }

  isTableOccupied(table: Table): boolean {
    return !!this.tableOrders[table.uuid];
  }
}
