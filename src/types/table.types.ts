export type ColumnType = 'text' | 'number' | 'readonly';

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  type: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  quantity: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export type FilterValue = string | { min?: number; max?: number };

export type FilterState<T> = Partial<Record<keyof T, FilterValue>>;

export interface RowEditState<T> {
  draft: T;
  original: T;
  history: T[];
}

export type ViewMode = 'virtual' | 'pagination';

export interface TableStats {
  total: number;
  filtered: number;
  unsaved: number;
}
