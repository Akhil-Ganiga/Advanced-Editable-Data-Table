import type { Employee, FilterState, FilterValue, SortConfig } from '../types/table.types';

export function applyFilters(
  data: Employee[],
  filters: FilterState<Employee>,
): Employee[] {
  const entries = Object.entries(filters) as [keyof Employee, FilterValue][];
  if (entries.length === 0) return data;

  return data.filter((row) =>
    entries.every(([key, filter]) => {
      const value = row[key];

      if (typeof filter === 'string') {
        if (!filter.trim()) return true;
        return String(value).toLowerCase().includes(filter.toLowerCase());
      }

      const num = Number(value);
      if (Number.isNaN(num)) return true;
      if (filter.min != null && num < filter.min) return false;
      if (filter.max != null && num > filter.max) return false;
      return true;
    }),
  );
}

export function applySorting(
  data: Employee[],
  sortConfigs: SortConfig<Employee>[],
): Employee[] {
  if (sortConfigs.length === 0) return data;

  return [...data].sort((a, b) => {
    for (const { key, direction } of sortConfigs) {
      const aVal = a[key];
      const bVal = b[key];

      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }

      if (cmp !== 0) {
        return direction === 'asc' ? cmp : -cmp;
      }
    }
    return 0;
  });
}

export function paginate<T>(data: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

export function rowsEqual<T extends object>(a: T, b: T): boolean {
  const keys = Object.keys(a) as (keyof T)[];
  return keys.every((key) => a[key] === b[key]);
}
