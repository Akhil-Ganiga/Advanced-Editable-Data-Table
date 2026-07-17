import type { ColumnDef, Employee } from '../../types/table.types';
import { useTableContext } from '../../context/TableContext';

interface EditableCellProps {
  rowId: number;
  column: ColumnDef<Employee>;
  value: string | number;
  isEditing: boolean;
}

export function EditableCell({ rowId, column, value, isEditing }: EditableCellProps) {
  const { updateDraft, startEdit } = useTableContext();

  if (column.type === 'readonly' || !isEditing) {
    const display =
      column.type === 'number' && column.key === 'salary'
        ? `$${Number(value).toLocaleString()}`
        : String(value);

    return (
      <span
        className={`cell-display ${column.type !== 'readonly' ? 'cell-editable' : ''}`}
        onDoubleClick={() => column.type !== 'readonly' && startEdit(rowId)}
        title={column.type !== 'readonly' ? 'Double-click to edit' : undefined}
      >
        {display}
      </span>
    );
  }

  const handleChange = (raw: string) => {
    if (column.type === 'number') {
      const parsed = raw === '' ? 0 : Number(raw);
      if (!Number.isNaN(parsed)) {
        updateDraft(rowId, column.key, parsed);
      }
    } else {
      updateDraft(rowId, column.key, raw);
    }
  };

  return (
    <input
      className="cell-input"
      type={column.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      aria-label={`Edit ${column.label}`}
      autoFocus
    />
  );
}
