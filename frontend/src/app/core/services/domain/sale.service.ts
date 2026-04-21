import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Sale {
  id: number;
  uuid: string;
  restaurant_id: number;
  order_id: number;
  user_id: number;
  ticket_number?: number;
  opened_by_user_id: number;
  closed_by_user_id?: number;
  opened_at: string;
  closed_at?: string;
  value_date?: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface SaleListResponse {
  data: Sale[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  list(page = 1, perPage = 100): Observable<SaleListResponse> {
    return this.http.get<SaleListResponse>(
      `${this.apiUrl}?page=${page}&per_page=${perPage}`
    );
  }

  get(uuid: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Sale>): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, data);
  }

  process(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/process`, data);
  }

  update(uuid: string, data: Partial<Sale>): Observable<Sale> {
    return this.http.put<Sale>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  closeSale(uuid: string): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/${uuid}/close`, {});
  }
}
