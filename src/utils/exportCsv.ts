import type { ColumnDef } from '../types/table.types';

export function exportToCsv<T extends object>(
  rows: T[],
  columns: ColumnDef<T>[],
  filename = 'table-export.csv',
): void {
  const headers = columns.map((col) => col.label);
  const keys = columns.map((col) => String(col.key));

  const escapeCell = (value: unknown): string => {
    const str = value == null ? '' : String(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) =>
      keys.map((key) => escapeCell((row as Record<string, unknown>)[key])).join(','),
    ),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
