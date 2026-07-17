import { useTableContext } from '../../context/TableContext';
import { exportToCsv } from '../../utils/exportCsv';
import { TableHeader } from './TableHeader';
import { VirtualTableBody } from './VirtualTableBody';
import { PaginatedTableBody } from './PaginatedTableBody';
import { PaginationControls } from './PaginationControls';
import { FilterBar } from './FilterBar';

export function EditableDataTable() {
  const {
    columns,
    filteredRows,
    viewMode,
    setViewMode,
    stats,
    hasUnsavedChanges,
  } = useTableContext();

  const handleExport = () => {
    exportToCsv(filteredRows, columns, 'employees-export.csv');
  };

  return (
    <div className="editable-table">
      <header className="table-toolbar">
        <div className="toolbar-left">
          <h1 className="table-title">Employee Directory</h1>
          <p className="table-subtitle">
            {stats.total.toLocaleString()} total rows ·{' '}
            {stats.filtered.toLocaleString()} shown
            {stats.unsaved > 0 && (
              <span className="unsaved-badge" role="status">
                {stats.unsaved} unsaved
              </span>
            )}
          </p>
        </div>

        <div className="toolbar-right">
          <div className="view-mode-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`btn btn--sm ${viewMode === 'virtual' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setViewMode('virtual')}
            >
              Virtual scroll
            </button>
            <button
              type="button"
              className={`btn btn--sm ${viewMode === 'pagination' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setViewMode('pagination')}
            >
              Pagination
            </button>
          </div>

          <button type="button" className="btn btn--secondary btn--sm" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </header>

      {hasUnsavedChanges && (
        <div className="unsaved-banner" role="alert">
          You have unsaved changes. Save or cancel before leaving the page.
        </div>
      )}

      <FilterBar />

      <div className="table-container" role="table" aria-label="Employee data table">
        <TableHeader />
        {viewMode === 'virtual' ? <VirtualTableBody /> : <PaginatedTableBody />}
      </div>

      {viewMode === 'pagination' && <PaginationControls />}
    </div>
  );
}
