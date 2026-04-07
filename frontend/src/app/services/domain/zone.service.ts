import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/zones`;

  constructor(private http: HttpClient) {}

  list(page: number = 1, perPage: number = 15): Observable<ZoneListResponse> {
    return this.http.get<ZoneListResponse>(`${this.apiUrl}?page=${page}&per_page=${perPage}`);
  }

  get(uuid: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/${uuid}`);
  }

  create(name: string): Observable<Zone> {
    return this.http.post<Zone>(this.apiUrl, { name });
  }

  update(uuid: string, name: string): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/${uuid}`, { name });
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }
}
