import type { ColumnDef, Employee } from '../../types/table.types';
import { useTableContext } from '../../context/TableContext';

function TextFilter({ column }: { column: ColumnDef<Employee> }) {
  const { filters, setFilter } = useTableContext();
  const value = (filters[column.key] as string) ?? '';

  return (
    <input
      type="text"
      className="filter-input"
      placeholder={`Filter ${column.label.toLowerCase()}…`}
      value={value}
      onChange={(e) => setFilter(column.key, e.target.value)}
      aria-label={`Filter by ${column.label}`}
    />
  );
}

function NumberFilter({ column }: { column: ColumnDef<Employee> }) {
  const { filters, setFilter } = useTableContext();
  const range = (filters[column.key] as { min?: number; max?: number }) ?? {};

  const updateRange = (field: 'min' | 'max', raw: string) => {
    const next = { ...range };
    if (raw === '') {
      delete next[field];
    } else {
      const num = Number(raw);
      if (!Number.isNaN(num)) next[field] = num;
    }
    setFilter(column.key, Object.keys(next).length ? next : undefined);
  };

  return (
    <div className="number-filter">
      <input
        type="number"
        className="filter-input filter-input--narrow"
        placeholder="Min"
        value={range.min ?? ''}
        onChange={(e) => updateRange('min', e.target.value)}
        aria-label={`Minimum ${column.label}`}
      />
      <span className="filter-separator">–</span>
      <input
        type="number"
        className="filter-input filter-input--narrow"
        placeholder="Max"
        value={range.max ?? ''}
        onChange={(e) => updateRange('max', e.target.value)}
        aria-label={`Maximum ${column.label}`}
      />
    </div>
  );
}

export function FilterBar() {
  const { columns, hasActiveFilters, clearFilters } = useTableContext();
  const filterableColumns = columns.filter((c) => c.filterable);

  return (
    <div className="filter-bar">
      <div className="filter-bar-header">
        <h2 className="filter-bar-title">Filters</h2>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          Clear filters
        </button>
      </div>
      <div className="filter-grid">
        {filterableColumns.map((column) => (
          <div key={String(column.key)} className="filter-field">
            <label className="filter-label">{column.label}</label>
            {column.type === 'number' ? (
              <NumberFilter column={column} />
            ) : (
              <TextFilter column={column} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
