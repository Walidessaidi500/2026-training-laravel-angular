import { Injectable, Injector } from '@angular/core';
import { BaseApiService } from '../api/base-api.service';
import { Observable, map } from 'rxjs';

export interface Tax {
  uuid: string;
  name: string;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaxService extends BaseApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  getTaxes(): Observable<Tax[]> {
    return this.httpCall('/taxes', {}, 'get').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Tax[])
    );
  }

  getTax(uuid: string): Observable<Tax> {
    return this.httpCall(`/taxes/${uuid}`, {}, 'get').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Tax)
    );
  }

  createTax(tax: Partial<Tax>): Observable<Tax> {
    return this.httpCall('/taxes', tax, 'post').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Tax)
    );
  }

  updateTax(uuid: string, tax: Partial<Tax>): Observable<Tax> {
    return this.httpCall(`/taxes/${uuid}`, tax, 'put').pipe(
      map((response: any) => (response.data !== undefined ? response.data : response) as Tax)
    );
  }

  deleteTax(uuid: string): Observable<void> {
    return this.httpCall(`/taxes/${uuid}`, {}, 'delete').pipe(
      map(() => undefined)
    );
  }
}
