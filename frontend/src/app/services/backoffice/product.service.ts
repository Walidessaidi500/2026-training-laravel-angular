import { Injectable, Injector } from '@angular/core';
import { BaseApiService, ApiResponse } from '../api/base-api.service';
import { Observable, map } from 'rxjs';

export interface Product {
  uuid: string;
  name: string;
  familyUuid: string;
  taxUuid: string;
  price: number;
  stock: number;
  active: boolean;
  imageSrc?: string;
  createdAt: string;
  updatedAt: string;
}

function mapProduct(data: any): Product {
  return {
    uuid: data.uuid,
    name: data.name,
    familyUuid: data.family_id || data.familyUuid,
    taxUuid: data.tax_id || data.taxUuid,
    price: data.price,
    stock: data.stock,
    active: !!data.active,
    imageSrc: data.image_src || data.imageSrc,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  getProducts(): Observable<Product[]> {
    return this.httpCall('/products', {}, 'get').pipe(
      map((response: any) => {
        const data = response.data !== undefined ? response.data : response;
        return (Array.isArray(data) ? data.map(mapProduct) : []) as Product[];
      })
    );
  }

  getProduct(uuid: string): Observable<Product> {
    return this.httpCall(`/products/${uuid}`, {}, 'get').pipe(
      map((response: any) => mapProduct(response.data !== undefined ? response.data : response))
    );
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.httpCall('/products', product, 'post').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Product)
    );
  }

  updateProduct(uuid: string, product: Partial<Product>): Observable<Product> {
    return this.httpCall(`/products/${uuid}`, product, 'put').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Product)
    );
  }

  deleteProduct(uuid: string): Observable<void> {
    return this.httpCall(`/products/${uuid}`, {}, 'delete').pipe(
      map(() => undefined)
    );
  }

  toggleActive(uuid: string): Observable<Product> {
    return this.httpCall(`/products/${uuid}/toggle-active`, {}, 'patch').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Product)
    );
  }
}
