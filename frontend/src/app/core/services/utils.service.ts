import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  /**
   * Calculates common stats from an array of objects
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
   * Formats a name to initials
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
   * Deep clone an object
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
