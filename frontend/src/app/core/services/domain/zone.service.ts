import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Zone {
  uuid: string;
  name: string;
  tableCount?: number;
  created_at: string;
  updated_at: string;
}

export interface ZoneListResponse {
  data: Zone[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ZoneService {

  constructor(private http: HttpClient) {}

  list(page: number = 1, perPage: number = 15): Observable<ZoneListResponse> {
    return this.http.get<ZoneListResponse>(`zones?page=${page}&per_page=${perPage}`);
  }

  get(uuid: string): Observable<Zone> {
    return this.http.get<Zone>(`zones/${uuid}`);
  }

  create(name: string): Observable<Zone> {
    return this.http.post<Zone>('zones', { name });
  }

  update(uuid: string, name: string): Observable<Zone> {
    return this.http.put<Zone>(`zones/${uuid}`, { name });
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`zones/${uuid}`);
  }
}
