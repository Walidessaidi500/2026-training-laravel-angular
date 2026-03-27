import { Injectable, Injector } from '@angular/core';
import { BaseApiService } from '../api/base-api.service';
import { Observable, map } from 'rxjs';

export interface Zone {
  uuid: string;
  name: string;
}

export interface Table {
  uuid: string;
  name: string;
  zoneUuid: string;
}

function mapZone(data: any): Zone {
  return {
    uuid: data.uuid,
    name: data.name
  };
}

function mapTable(data: any): Table {
  return {
    uuid: data.uuid,
    name: data.name,
    zoneUuid: data.zone_id || data.zoneUuid
  };
}

@Injectable({
  providedIn: 'root'
})
export class ZoneService extends BaseApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  getZones(): Observable<Zone[]> {
    return this.httpCall('/zones', {}, 'get').pipe(
      map((response: any) => {
        const data = response.data !== undefined ? response.data : response;
        return (Array.isArray(data) ? data.map(mapZone) : []) as Zone[];
      })
    );
  }

  getZone(uuid: string): Observable<Zone> {
    return this.httpCall(`/zones/${uuid}`, {}, 'get').pipe(
      map((response: any) => mapZone(response.data !== undefined ? response.data : response))
    );
  }

  createZone(zone: Partial<Zone>): Observable<Zone> {
    return this.httpCall('/zones', zone, 'post').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Zone)
    );
  }

  updateZone(uuid: string, zone: Partial<Zone>): Observable<Zone> {
    return this.httpCall(`/zones/${uuid}`, zone, 'put').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Zone)
    );
  }

  deleteZone(uuid: string): Observable<void> {
    return this.httpCall(`/zones/${uuid}`, {}, 'delete').pipe(
      map(() => undefined)
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class TableService extends BaseApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  getTables(): Observable<Table[]> {
    return this.httpCall('/tables', {}, 'get').pipe(
      map((response: any) => {
        const data = response.data !== undefined ? response.data : response;
        return (Array.isArray(data) ? data.map(mapTable) : []) as Table[];
      })
    );
  }

  getTable(uuid: string): Observable<Table> {
    return this.httpCall(`/tables/${uuid}`, {}, 'get').pipe(
      map((response: any) => mapTable(response.data !== undefined ? response.data : response))
    );
  }

  createTable(table: Partial<Table>): Observable<Table> {
    return this.httpCall('/tables', table, 'post').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Table)
    );
  }

  updateTable(uuid: string, table: Partial<Table>): Observable<Table> {
    return this.httpCall(`/tables/${uuid}`, table, 'put').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Table)
    );
  }

  deleteTable(uuid: string): Observable<void> {
    return this.httpCall(`/tables/${uuid}`, {}, 'delete').pipe(
      map(() => undefined)
    );
  }
}
