import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Movement {
  uuid: string;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  description: string;
  resource_type: string | null;
  resource_id: string | null;
  changes: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface MovementResponse {
  data: Movement[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/movements`;

  list(page: number = 1, perPage: number = 50): Observable<MovementResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString());

    return this.http.get<MovementResponse>(this.apiUrl, { params });
  }
}
