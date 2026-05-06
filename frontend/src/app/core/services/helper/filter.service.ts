import { Injectable } from '@angular/core';

export interface FilterCriteria<T> {
  searchTerm?: string;
  searchProperties?: (keyof T)[];
  status?: string;
  propertyFilters?: {
    property: keyof T;
    value: any;
    treatAsNone?: any;
  }[];
  customFilters?: ((item: T) => boolean)[];
}

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  /**
   * Aplica multiples filtros a una lista de objetos según los criterios especificados
   */
  applyFilters<T>(items: T[], criteria: FilterCriteria<T>): T[] {
    if (!items || !items.length) {
      return [];
    }

    let filtered = [...items];

    // Buscar por termino en propiedades específicas
    if (criteria.searchTerm && criteria.searchProperties?.length) {
      filtered = this.filterBySearchTerm(
        filtered,
        criteria.searchTerm,
        criteria.searchProperties
      );
    }

    // Estado activo/inactivo
    if (criteria.status && criteria.status !== 'all') {
      filtered = this.filterByStatus(filtered as any, criteria.status) as any;
    }

    // Filtros por propiedad específica
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

    // Filtros personalizados
    if (criteria.customFilters?.length) {
      criteria.customFilters.forEach((filterFn) => {
        filtered = filtered.filter(filterFn);
      });
    }

    return filtered;
  }

  /**
   * Filtra una lista de objetos por un termino de busqueda en una o varias propiedades
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
   * Filtra por una propiedad especifica y un valor
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
