import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Table {
  id: number;
  uuid: string;
  zone_id: string;
  name: string;
  created_at: string;
}

export interface TableListResponse {
  data: Table[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private readonly apiUrl = `${environment.apiUrl}/tables`;

  constructor(private http: HttpClient) {}

  list(page: number = 1, perPage: number = 1000): Observable<TableListResponse> {
    return this.http.get<TableListResponse>(`${this.apiUrl}?page=${page}&per_page=${perPage}`);
  }

  get(uuid: string): Observable<Table> {
    return this.http.get<Table>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Table>): Observable<Table> {
    return this.http.post<Table>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<Table>): Observable<Table> {
    return this.http.put<Table>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }
}
