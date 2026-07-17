import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTableContext } from '../../context/TableContext';
import { TableRow } from './TableRow';

const ROW_HEIGHT = 52;

export function VirtualTableBody() {
  const { displayRows } = useTableContext();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: displayRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="table-body virtual-scroll" role="rowgroup">
      <div
        className="virtual-inner"
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {items.map((virtualRow) => {
          const row = displayRows[virtualRow.index];
          return (
            <TableRow
              key={row.id}
              row={row}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
