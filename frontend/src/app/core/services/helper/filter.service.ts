import { Injectable } from '@angular/core';

export interface FilterCriteria<T> {
  searchTerm?: string;
  searchProperties?: (keyof T)[];
  status?: string; // 'active', 'inactive', 'all'
  propertyFilters?: {
    property: keyof T;
    value: any;
    treatAsNone?: any; // Valor que se tratará como "ninguno" (ej. 'none', null, undefined)
  }[];
  customFilters?: ((item: T) => boolean)[];
}

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  /**
   * Aplica múltiples filtros a una lista de objetos según los criterios especificados
   */
  applyFilters<T>(items: T[], criteria: FilterCriteria<T>): T[] {
    if (!items || !items.length) {
      return [];
    }

    let filtered = [...items];

    // 1. Search term filter
    if (criteria.searchTerm && criteria.searchProperties?.length) {
      filtered = this.filterBySearchTerm(
        filtered,
        criteria.searchTerm,
        criteria.searchProperties
      );
    }

    // 2. Estado activo/inactivo
    if (criteria.status && criteria.status !== 'all') {
      filtered = this.filterByStatus(filtered as any, criteria.status) as any;
    }

    // 3. Filtros por propiedad específica
    if (criteria.propertyFilters?.length) {
      criteria.propertyFilters.forEach((filter) => {
        filtered = this.filterByProperty(
          filtered,
          filter.property,
          filter.value,
          filter.treatAsNone
        );
      });
    }

    // 4. Filtros personalizados
    if (criteria.customFilters?.length) {
      criteria.customFilters.forEach((filterFn) => {
        filtered = filtered.filter(filterFn);
      });
    }

    return filtered;
  }

  /**
   * Filtra una lista de objetos por un término de búsqueda en una o varias propiedades
   */
  filterBySearchTerm<T>(
    items: T[],
    searchTerm: string,
    properties: (keyof T)[]
  ): T[] {
    if (!searchTerm || !items.length) {
      return [...items];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return items.filter((item) => {
      return properties.some((prop) => {
        const value = item[prop];
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(lowerSearchTerm);
      });
    });
  }

  /**
   * Filtra una lista por un estado activo/inactivo
   */
  filterByStatus<T extends { active: boolean }>(
    items: T[],
    status: string
  ): T[] {
    if (!status || status === 'all') {
      return [...items];
    }
    const wantActive = status === 'active';
    return items.filter((item) => item.active === wantActive);
  }

  /**
   * Filtra por una propiedad específica y un valor
   */
  filterByProperty<T>(
    items: T[],
    property: keyof T,
    value: any,
    treatAsNone: any = 'none'
  ): T[] {
    if (value === 'all' || value === undefined || value === null) {
      return [...items];
    }

    if (value === treatAsNone) {
      return items.filter((item) => !item[property]);
    }

    return items.filter((item) => item[property] === value);
  }
}
