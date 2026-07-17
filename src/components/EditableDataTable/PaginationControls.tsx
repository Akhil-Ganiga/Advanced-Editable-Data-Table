import { useTableContext } from '../../context/TableContext';

export function PaginationControls() {
  const { page, totalPages, pageSize, setPage, setPageSize, filteredRows } = useTableContext();

  const start = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filteredRows.length);

  return (
    <div className="pagination" role="navigation" aria-label="Table pagination">
      <span className="pagination-info">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{' '}
        {filteredRows.length.toLocaleString()}
      </span>

      <div className="pagination-controls">
        <label className="pagination-size">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Rows per page"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </label>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setPage(1)}
          disabled={page <= 1}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="pagination-page">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setPage(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}
