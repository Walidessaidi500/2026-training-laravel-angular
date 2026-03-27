import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Order {
  id: number;
  uuid: string;
  restaurant_id: number;
  status: string;
  table_id: number;
  opened_by_user_id: number;
  closed_by_user_id?: number;
  diners: number;
  opened_at: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  data: Order[];
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
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  list(page = 1, perPage = 100): Observable<OrderListResponse> {
    return this.http.get<OrderListResponse>(
      `${this.apiUrl}?page=${page}&per_page=${perPage}`
    );
  }

  get(uuid: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  closeOrder(uuid: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${uuid}/close`, {});
  }
}
