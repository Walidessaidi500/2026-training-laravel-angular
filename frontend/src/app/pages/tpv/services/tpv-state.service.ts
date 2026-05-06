import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, map, of, catchError, tap } from 'rxjs';
import { Zone, ZoneService } from '@services/domain/zone.service';
import { Table, TableService } from '@services/domain/table.service';
import { Product, ProductService } from '@services/domain/product.service';
import { Family, FamilyService } from '@services/domain/family.service';
import { Tax, TaxService } from '@services/domain/tax.service';
import { Order, OrderService } from '@services/domain/order.service';
import { User, UserService } from '@services/domain/user.service';
import { AuthService } from '@services/auth/auth.service';
import { UiService } from '@app/core/services/ui/ui.service';
import { ActionSheetController } from '@ionic/angular';

export type TpvViewState = 'tables' | 'order';

interface TpvState {
  viewState: TpvViewState;
  zones: Zone[];
  selectedZoneUuid: string | null;
  tables: Table[];
  filteredTables: Table[];
  tableOrders: { [tableUuid: string]: boolean };
  families: Family[];
  selectedFamilyUuid: string | null;
  taxes: Tax[];
  products: Product[];
  filteredProducts: Product[];
  users: User[];
  selectedTable: Table | null;
  
  
  showUserSelection: boolean;
  showDinersSelection: boolean;
  showPinModal: boolean;
  showPaymentModal: boolean;
  userSelectionContext: 'opening' | 'closing';
  selectedOpUser: User | null;
  selectedUserForPin: User | null;
  pinBuffer: string;
}

@Injectable({
  providedIn: 'root'
})
export class TpvStateService {
  private readonly zoneService = inject(ZoneService);
  private readonly tableService = inject(TableService);
  private readonly productService = inject(ProductService);
  private readonly familyService = inject(FamilyService);
  private readonly taxService = inject(TaxService);
  private readonly orderService = inject(OrderService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly actionSheetCtrl = inject(ActionSheetController);

  private readonly _state = new BehaviorSubject<TpvState>({
    viewState: 'tables',
    zones: [],
    selectedZoneUuid: null,
    tables: [],
    filteredTables: [],
    tableOrders: {},
    families: [],
    selectedFamilyUuid: null,
    taxes: [],
    products: [],
    filteredProducts: [],
    users: [],
    selectedTable: null,
    showUserSelection: false,
    showDinersSelection: false,
    showPinModal: false,
    showPaymentModal: false,
    userSelectionContext: 'opening',
    selectedOpUser: null,
    selectedUserForPin: null,
    pinBuffer: ''
  });

  public readonly state$ = this._state.asObservable();

  public get state(): TpvState {
    return this._state.value;
  }

  private updateState(patch: Partial<TpvState>) {
    this._state.next({ ...this.state, ...patch });
  }

  public loadInitialData() {
    const currentUser = this.authService.getUser();
    
    return forkJoin({
      zones: this.zoneService.list(1, 100),
      tables: this.tableService.list(1, 100),
      families: this.familyService.list(true),
      taxes: this.taxService.list(),
      products: this.productService.list(1, 500, true),
      activeOrders: this.orderService.list(1, 1000),
      users: this.userService.list(1, 100).pipe(
        map(res => res.data.filter(u => u.role === 'operator' || u.role === 'supervisor')),
        catchError(() => of([]))
      )
    }).pipe(
      tap(res => {
        let users = res.users;
        if (users.length === 0 && currentUser) {
          users = [currentUser as unknown as User];
        }

        const tableOrders = this.processActiveOrders(res.activeOrders.data, res.tables.data);
        const selectedZoneUuid = this.state.selectedZoneUuid || (res.zones.data.length > 0 ? res.zones.data[0].uuid : null);
        const filteredTables = res.tables.data.filter(t => t.zone_id === selectedZoneUuid);
        const selectedFamilyUuid = res.families.data.length > 0 ? res.families.data[0].uuid : null;
        const filteredProducts = res.products.data.filter(p => p.family_id === selectedFamilyUuid && p.active && p.stock > 0 && p.tax_id);

        this.updateState({
          zones: res.zones.data,
          tables: res.tables.data,
          families: res.families.data,
          taxes: res.taxes.data,
          products: res.products.data,
          users,
          tableOrders,
          selectedZoneUuid,
          filteredTables,
          selectedFamilyUuid,
          filteredProducts
        });
      })
    );
  }

  private processActiveOrders(orders: Order[], tables: Table[]): { [tableUuid: string]: boolean } {
    const tableOrders: { [tableUuid: string]: boolean } = {};
    orders.forEach(order => {
      if (order.status === 'open') {
        const table = tables.find(t => t.uuid === order.table_uuid);
        if (table) {
          tableOrders[table.uuid] = true;
        }
      }
    });
    return tableOrders;
  }

  public refreshTableStatus() {
    this.orderService.list(1, 1000).subscribe(res => {
      const tableOrders = this.processActiveOrders(res.data, this.state.tables);
      this.updateState({ tableOrders });
    });
  }

  public selectZone(zoneUuid: string) {
    const filteredTables = this.state.tables.filter(t => t.zone_id === zoneUuid);
    this.updateState({ selectedZoneUuid: zoneUuid, filteredTables });
  }

  public selectFamily(familyUuid: string) {
    const filteredProducts = this.state.products.filter(p => 
      p.family_id === familyUuid && p.active && p.stock > 0 && p.tax_id
    );
    this.updateState({ selectedFamilyUuid: familyUuid, filteredProducts });
  }

  public setViewState(viewState: TpvViewState) {
    this.updateState({ viewState });
  }

  public setSelectedTable(table: Table | null) {
    this.updateState({ selectedTable: table });
  }

  public setShowUserSelection(show: boolean, context?: 'opening' | 'closing') {
    const patch: any = { showUserSelection: show };
    if (context) patch.userSelectionContext = context;
    this.updateState(patch);
  }

  public setShowPinModal(show: boolean, user: User | null = null) {
    this.updateState({ showPinModal: show, selectedUserForPin: user, pinBuffer: '' });
  }

  public addPinDigit(digit: string) {
    if (this.state.pinBuffer.length < 10) {
      this.updateState({ pinBuffer: this.state.pinBuffer + digit });
    }
  }

  public removePinDigit() {
    if (this.state.pinBuffer.length > 0) {
      this.updateState({ pinBuffer: this.state.pinBuffer.slice(0, -1) });
    }
  }

  public resetPinBuffer() {
    this.updateState({ pinBuffer: '' });
  }

  public setShowDinersSelection(show: boolean) {
    this.updateState({ showDinersSelection: show });
  }

  public setShowPaymentModal(show: boolean) {
    this.updateState({ showPaymentModal: show });
  }

  public setSelectedOpUser(user: User | null) {
    this.updateState({ selectedOpUser: user });
  }

  // Logica de union de mesas

  public confirmJoin(slaveTable: Table, masterTable: Table) {
    this.updateTableInState(slaveTable.uuid, masterTable.uuid);

    this.tableService.update(slaveTable.uuid, { 
      joined_to_uuid: masterTable.uuid,
      zone_id: slaveTable.zone_id,
      name: slaveTable.name
    }).subscribe({
      next: (updatedTable) => {
        this.syncTableQuietly(updatedTable);
        this.uiService.showSuccess(`Mesa ${slaveTable.name} juntada`);
      },
      error: () => {
        this.loadInitialData().subscribe();
        this.uiService.showError('Error al juntar mesas');
      }
    });
  }

  // Logica de separacion de mesas
  public confirmUnjoin(table: Table, joinedTables: Table[]) {
    if (joinedTables.length > 0) {
      joinedTables.forEach(t => {
        const tInList = this.state.tables.find(tbl => tbl.uuid === t.uuid);
        if (tInList) tInList.joined_to_uuid = undefined;
      });
      this.updateState({ tables: [...this.state.tables] });
      if (this.state.selectedZoneUuid) this.selectZone(this.state.selectedZoneUuid);

      joinedTables.forEach(t => {
        this.tableService.update(t.uuid, { 
          joined_to_uuid: null as any,
          zone_id: t.zone_id,
          name: t.name
        }).subscribe({
          next: (updated) => this.syncTableQuietly(updated),
          error: () => this.loadInitialData().subscribe()
        });
      });
      this.uiService.showSuccess(`Mesas separadas de la Mesa ${table.name}`);
    } else {
      this.updateTableInState(table.uuid, undefined);
      this.tableService.update(table.uuid, { 
        joined_to_uuid: null as any,
        zone_id: table.zone_id,
        name: table.name
      }).subscribe({
        next: (updated) => {
          this.syncTableQuietly(updated);
          this.uiService.showSuccess(`Mesa ${table.name} separada`);
        },
        error: () => this.loadInitialData().subscribe()
      });
    }
  }

  // Actualizar el estado de la mesa
  private updateTableInState(tableUuid: string, joinedToUuid: string | undefined) {
    const tables = [...this.state.tables];
    const table = tables.find(t => t.uuid === tableUuid);
    if (table) {
      table.joined_to_uuid = joinedToUuid;
      const filteredTables = this.state.selectedZoneUuid 
        ? tables.filter(t => t.zone_id === this.state.selectedZoneUuid)
        : this.state.filteredTables;
      this.updateState({ tables, filteredTables });
    }
  }
  // Sincronizar la mesa actualizada sin recargar todos los datos
  private syncTableQuietly(updatedTable: Table) {
    const tables = [...this.state.tables];
    const idx = tables.findIndex(t => t.uuid === updatedTable.uuid);
    if (idx !== -1) {
      tables[idx] = { ...tables[idx], ...updatedTable };
      this.updateState({ tables });
    }
  }
}