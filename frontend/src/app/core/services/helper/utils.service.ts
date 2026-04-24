import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  /**
   * Calcula estadísticas comunes a partir de un array de objetos
   */
  calculateStats<T>(
    items: T[],
    criteria: {
      label: string;
      filterFn: (item: T) => boolean;
    }[]
  ): { [key: string]: number } {
    const stats: { [key: string]: number } = {
      total: items.length,
    };

    criteria.forEach((c) => {
      stats[c.label] = items.filter(c.filterFn).length;
    });

    return stats;
  }

  /**
   * Formatos comunes de texto, como obtener iniciales de un nombre
   */
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Clona profundamente un objeto usando JSON (útil para objetos simples sin funciones ni fechas)
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
