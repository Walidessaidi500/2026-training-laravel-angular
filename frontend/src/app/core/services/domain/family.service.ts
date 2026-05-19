import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  list(active?: boolean): Observable<FamilyListResponse> {
    let url = 'families';
    if (active !== undefined) {
      url += `?active=${active ? 1 : 0}`;
    }
    return this.http.get<FamilyListResponse>(url);
  }

  get(uuid: string): Observable<Family> {
    return this.http.get<Family>(`families/${uuid}`);
  }

  create(data: Partial<Family>): Observable<Family> {
    return this.http.post<Family>('families', data);
  }

  update(uuid: string, data: Partial<Family>): Observable<Family> {
    return this.http.put<Family>(`families/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`families/${uuid}`);
  }

  toggle(uuid: string): Observable<Family> {
    return this.http.patch<Family>(`families/${uuid}/toggle-active`, {});
  }
}
