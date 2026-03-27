import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Zone {
  uuid: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface ZoneListResponse {
  data: Zone[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  private readonly apiUrl = `${environment.apiUrl}/zones`;

  constructor(private http: HttpClient) {}

  list(): Observable<ZoneListResponse> {
    return this.http.get<ZoneListResponse>(this.apiUrl);
  }

  get(uuid: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Zone>): Observable<Zone> {
    return this.http.post<Zone>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<Zone>): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }
}
