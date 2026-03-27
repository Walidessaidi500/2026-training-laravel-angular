import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface User {
  id: number;
  uuid: string;
  restaurant_id: number;
  role: string;
  image_src?: string;
  name: string;
  email: string;
  pin?: string;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  list(page = 1, perPage = 100): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(
      `${this.apiUrl}?page=${page}&per_page=${perPage}`
    );
  }

  get(uuid: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${uuid}`);
  }

  create(data: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }

  update(uuid: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  toggleActive(uuid: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${uuid}/toggle-active`, {});
  }
}
