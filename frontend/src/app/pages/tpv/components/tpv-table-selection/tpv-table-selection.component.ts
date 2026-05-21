import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Zone } from '@services/domain/zone.service';
import { Table } from '@services/domain/table.service';
import { addIcons } from 'ionicons';
import { gridOutline, layersOutline } from 'ionicons/icons';

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
  @Input() allTables: Table[] = [];
  @Input() tableOrders: { [tableUuid: string]: boolean } = {};

  @Output() zoneSelect = new EventEmitter<string>();
  @Output() tableClick = new EventEmitter<Table>();
  @Output() tableLongPress = new EventEmitter<Table>();

  private pressTimeout: any;
  private isLongPress = false;

  constructor() {
    addIcons({ gridOutline, layersOutline });
  }

  get displayTables(): Table[] {
    return this.filteredTables.filter(t => !t.joined_to_uuid);
  }

  getTableName(table: Table): string {
    const joinedTables = this.allTables.filter(t => t.joined_to_uuid === table.uuid);
    if (joinedTables.length === 0) return table.name;
    return `${table.name} + ${joinedTables.map(t => t.name).join(' + ')}`;
  }

  hasJoinedTables(table: Table): boolean {
    return this.allTables.some(t => t.joined_to_uuid === table.uuid);
  }

  trackByTable(index: number, table: Table): string {
    return table.uuid;
  }

  selectZone(uuid: string) {
    this.zoneSelect.emit(uuid);
  }

  onPointerDown(table: Table, event: any) {
    this.isLongPress = false;
    this.pressTimeout = setTimeout(() => {
      this.isLongPress = true;
      this.tableLongPress.emit(table);
    }, 250);
  }

  onPointerUp(table: Table, event: any) {
    if (this.pressTimeout) {
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
    }
    if (!this.isLongPress) {
      this.tableClick.emit(table);
    }
  }

  onPointerLeave(event: any) {
    if (this.pressTimeout) {
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
    }
  }

  isTableOccupied(table: Table): boolean {
    return !!this.tableOrders[table.uuid];
  }
}
