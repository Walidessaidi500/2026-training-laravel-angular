import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  uuid: string;
  name: string;
  priceInCents: number;
  stock: number;
  active: boolean;
  family_id: string;
  tax_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private http: HttpClient) {}

  list(page: number = 1, perPage: number = 100, active?: boolean): Observable<ProductListResponse> {
    let url = `products?page=${page}&per_page=${perPage}`;
    if (active !== undefined) {
      url += `&active=${active ? 1 : 0}`;
    }
    return this.http.get<ProductListResponse>(url);
  }

  get(uuid: string): Observable<Product> {
    return this.http.get<Product>(`products/${uuid}`);
  }

  create(data: any): Observable<Product> {
    const backendData = {
      ...data,
      price_in_cents: data.priceInCents
    };
    delete backendData.priceInCents;
    return this.http.post<Product>('products', backendData);
  }

  update(uuid: string, data: any): Observable<Product> {
    const backendData = {
      ...data,
      price_in_cents: data.priceInCents
    };
    delete backendData.priceInCents;
    return this.http.put<Product>(`products/${uuid}`, backendData);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`products/${uuid}`);
  }

  toggle(uuid: string): Observable<Product> {
    return this.http.patch<Product>(`products/${uuid}/toggle-active`, {});
  }
}
