import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/taxes`;

  constructor(private http: HttpClient) {}

  list(): Observable<TaxListResponse> {
    return this.http.get<TaxListResponse>(this.apiUrl);
  }

  get(uuid: string): Observable<Tax> {
    return this.http.get<Tax>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Tax>): Observable<Tax> {
    return this.http.post<Tax>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<Tax>): Observable<Tax> {
    return this.http.put<Tax>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }
}
