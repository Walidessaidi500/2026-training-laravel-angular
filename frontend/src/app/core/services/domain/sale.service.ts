import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductOption } from './product.service';

export interface SaleLine {
  uuid: string;
  restaurant_id: number;
  sale_uuid: string;
  order_line_uuid: string;
  product_uuid: string;
  product_option?: ProductOption;
  user_uuid: string;
  quantity: number;
  price: number;
  tax_percentage: number;
  created_at: string;
  updated_at: string;
}

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
  lines?: SaleLine[];
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

  constructor(private http: HttpClient) {}

  list(page = 1, perPage = 100, date?: string): Observable<SaleListResponse> {
    let url = `sales?page=${page}&per_page=${perPage}`;
    if (date) {
      url += `&date=${date}`;
    }
    return this.http.get<SaleListResponse>(url);
  }

  get(uuid: string): Observable<Sale> {
    return this.http.get<Sale>(`sales/${uuid}`);
  }

  create(data: Partial<Sale>): Observable<Sale> {
    return this.http.post<Sale>('sales', data);
  }

  process(data: any): Observable<any> {
    return this.http.post<any>('sales/process', data);
  }

  update(uuid: string, data: Partial<Sale>): Observable<Sale> {
    return this.http.put<Sale>(`sales/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`sales/${uuid}`);
  }

  closeSale(uuid: string): Observable<Sale> {
    return this.http.post<Sale>(`sales/${uuid}/close`, {});
  }
}
