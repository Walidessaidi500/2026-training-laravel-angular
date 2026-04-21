import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Restaurant {
  uuid: string;
  name: string;
  address: string;
  city: string;
  active: boolean;
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
  private readonly apiUrl = `${environment.apiUrl}/restaurants`;

  constructor(private http: HttpClient) {}

  list(): Observable<RestaurantListResponse> {
    return this.http.get<RestaurantListResponse>(this.apiUrl);
  }

  get(uuid: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }
}
