import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Family {
  uuid: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface FamilyListResponse {
  data: Family[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FamilyService {
  private readonly apiUrl = `${environment.apiUrl}/families`;

  constructor(private http: HttpClient) {}

  list(active?: boolean): Observable<FamilyListResponse> {
    let url = this.apiUrl;
    if (active !== undefined) {
      url += `?active=${active ? 1 : 0}`;
    }
    return this.http.get<FamilyListResponse>(url);
  }

  get(uuid: string): Observable<Family> {
    return this.http.get<Family>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<Family>): Observable<Family> {
    return this.http.post<Family>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<Family>): Observable<Family> {
    return this.http.put<Family>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  toggle(uuid: string): Observable<Family> {
    return this.http.patch<Family>(`${this.apiUrl}/${uuid}/toggle-active`, {});
  }
}
