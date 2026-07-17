import type { CSSProperties } from 'react';
import type { Employee } from '../../types/table.types';
import { useTableContext } from '../../context/TableContext';
import { EditableCell } from './EditableCell';

interface TableRowProps {
  row: Employee;
  style?: CSSProperties;
}

export function TableRow({ row, style }: TableRowProps) {
  const {
    columns,
    editingRowId,
    startEdit,
    saveRow,
    cancelRow,
    undoRow,
    isRowDirty,
    canUndo,
    getRowData,
  } = useTableContext();

  const isEditing = editingRowId === row.id;
  const isDirty = isRowDirty(row.id);
  const rowData = isEditing ? getRowData(row.id) : row;

  return (
    <div
      className={`table-row ${isEditing ? 'table-row--editing' : ''} ${isDirty ? 'table-row--dirty' : ''}`}
      style={style}
      role="row"
    >
      {columns.map((column) => (
        <div
          key={String(column.key)}
          className="table-cell"
          role="cell"
          style={{ width: column.width, minWidth: column.width }}
        >
          <EditableCell
            rowId={row.id}
            column={column}
            value={rowData[column.key]}
            isEditing={isEditing}
          />
        </div>
      ))}

      <div className="table-cell table-cell--actions" role="cell">
        {isEditing ? (
          <div className="row-actions">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => saveRow(row.id)}
              disabled={!isDirty}
              aria-label={`Save row ${row.id}`}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => cancelRow(row.id)}
              aria-label={`Cancel editing row ${row.id}`}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => undoRow(row.id)}
              disabled={!canUndo(row.id)}
              aria-label={`Undo changes on row ${row.id}`}
            >
              Undo
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => startEdit(row.id)}
            aria-label={`Edit row ${row.id}`}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
