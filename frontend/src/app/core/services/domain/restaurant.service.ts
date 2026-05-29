import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Restaurant {
  uuid: string;
  name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  created_at: string;
}

export interface RestaurantListResponse {
  data: Restaurant[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {

  constructor(private http: HttpClient) {}

  list(): Observable<RestaurantListResponse> {
    return this.http.get<RestaurantListResponse>('restaurants');
  }

  get(uuid: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`restaurants/${uuid}`);
  }

  create(data: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>('restaurants', data);
  }

  update(uuid: string, data: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`restaurants/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`restaurants/${uuid}`);
  }
}
