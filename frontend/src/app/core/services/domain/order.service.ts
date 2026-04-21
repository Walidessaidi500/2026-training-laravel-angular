import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface OrderLine {
  uuid: string;
  restaurant_id: number;
  order_uuid: string;
  product_uuid: string;
  user_uuid: string;
  quantity: number;
  price: number;
  tax_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  uuid: string;
  restaurant_id: number;
  status: string;
  table_uuid: string;
  opened_by_user_uuid: string;
  closed_by_user_uuid?: string;
  diners: number;
  opened_at: string;
  closed_at?: string;
  lines?: OrderLine[];
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

  getActiveOrderByTable(tableUuid: string): Observable<Order | null> {
    return this.http.get<Order | null>(`${this.apiUrl}/table/${tableUuid}`);
  }

  create(data: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, data);
  }

  sync(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sync`, data);
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
