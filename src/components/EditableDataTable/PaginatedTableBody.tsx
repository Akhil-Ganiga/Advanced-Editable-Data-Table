import { useTableContext } from '../../context/TableContext';
import { TableRow } from './TableRow';

export function PaginatedTableBody() {
  const { displayRows } = useTableContext();

  return (
    <div className="table-body" role="rowgroup">
      {displayRows.map((row) => (
        <TableRow key={row.id} row={row} />
      ))}
    </div>
  );
}
