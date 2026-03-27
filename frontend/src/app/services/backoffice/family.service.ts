import { Injectable, Injector } from '@angular/core';
import { BaseApiService, ApiResponse } from '../api/base-api.service';
import { Observable, map } from 'rxjs';

export interface Family {
  uuid: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapFamily(data: any): Family {
  return {
    uuid: data.uuid,
    name: data.name,
    active: !!data.active,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt
  };
}

@Injectable({
  providedIn: 'root'
})
export class FamilyService extends BaseApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  getFamilies(): Observable<Family[]> {
    return this.httpCall('/families', {}, 'get').pipe(
      map((response: any) => {
        const data = response.data !== undefined ? response.data : response;
        return (Array.isArray(data) ? data.map(mapFamily) : []) as Family[];
      })
    );
  }

  getFamily(uuid: string): Observable<Family> {
    return this.httpCall(`/families/${uuid}`, {}, 'get').pipe(
      map((response: any) => mapFamily(response.data !== undefined ? response.data : response))
    );
  }

  createFamily(family: Partial<Family>): Observable<Family> {
    return this.httpCall('/families', family, 'post').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Family)
    );
  }

  updateFamily(uuid: string, family: Partial<Family>): Observable<Family> {
    return this.httpCall(`/families/${uuid}`, family, 'put').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Family)
    );
  }

  deleteFamily(uuid: string): Observable<void> {
    return this.httpCall(`/families/${uuid}`, {}, 'delete').pipe(
      map(() => undefined)
    );
  }

  toggleActive(uuid: string): Observable<Family> {
    return this.httpCall(`/families/${uuid}/toggle-active`, {}, 'patch').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Family)
    );
  }
}
