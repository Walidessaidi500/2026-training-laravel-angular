import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tax {
  uuid: string;
  name: string;
  percentage: number;
  created_at: string;
}

export interface TaxListResponse {
  data: Tax[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class TaxService {

  constructor(private http: HttpClient) {}

  list(): Observable<TaxListResponse> {
    return this.http.get<TaxListResponse>('taxes');
  }

  get(uuid: string): Observable<Tax> {
    return this.http.get<Tax>(`taxes/${uuid}`);
  }

  create(data: Partial<Tax>): Observable<Tax> {
    return this.http.post<Tax>('taxes', data);
  }

  update(uuid: string, data: Partial<Tax>): Observable<Tax> {
    return this.http.put<Tax>(`taxes/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`taxes/${uuid}`);
  }
}
