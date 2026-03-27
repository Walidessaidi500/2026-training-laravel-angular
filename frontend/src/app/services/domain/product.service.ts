import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Product {
  uuid: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  family_uuid: string;
  created_at: string;
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
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  list(): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(this.apiUrl);
  }

  get(uuid: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  toggle(uuid: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${uuid}/toggle-active`, {});
  }
}
