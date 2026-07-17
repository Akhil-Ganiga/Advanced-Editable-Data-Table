import type { Employee } from '../../types/table.types';
import { useTableContext } from '../../context/TableContext';

export function TableHeader() {
  const { columns, sortConfigs, toggleSort } = useTableContext();

  const getSortIndicator = (key: keyof Employee) => {
    const index = sortConfigs.findIndex((s) => s.key === key);
    if (index < 0) return null;
    const config = sortConfigs[index];
    const arrow = config.direction === 'asc' ? '↑' : '↓';
    return (
      <span className="sort-indicator" aria-hidden="true">
        {arrow}
        {sortConfigs.length > 1 && <span className="sort-priority">{index + 1}</span>}
      </span>
    );
  };

  return (
    <div className="table-header" role="row">
      {columns.map((column) => (
        <div
          key={String(column.key)}
          className={`table-header-cell ${column.sortable ? 'sortable' : ''}`}
          role="columnheader"
          style={{ width: column.width, minWidth: column.width }}
          aria-sort={
            sortConfigs.find((s) => s.key === column.key)
              ? sortConfigs.find((s) => s.key === column.key)!.direction === 'asc'
                ? 'ascending'
                : 'descending'
              : 'none'
          }
        >
          {column.sortable ? (
            <button
              type="button"
              className="header-sort-btn"
              onClick={(e) => toggleSort(column.key, e.shiftKey)}
              title="Click to sort. Shift+click for multi-column sort."
            >
              {column.label}
              {getSortIndicator(column.key)}
            </button>
          ) : (
            column.label
          )}
        </div>
      ))}
      <div className="table-header-cell table-header-cell--actions" role="columnheader">
        Actions
      </div>
    </div>
  );
}
