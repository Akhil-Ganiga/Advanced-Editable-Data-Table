# Advanced Editable Data Table

A React + TypeScript data table built for the Cloud Eagle AI frontend assessment. It handles **10,000+ rows** with inline editing, virtual scrolling, sorting, filtering, pagination, CSV export, and unsaved-change protection.

## Setup

**Requirements:** Node.js 18+ and npm

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Features

| Feature | Implementation |
|---------|----------------|
| Inline editing | Text (name, email, department) and numeric (salary, quantity) fields |
| Row actions | Save, Cancel, and Undo per row with change history (up to 20 steps) |
| Large datasets | 10,000 generated rows; virtual scrolling via `@tanstack/react-virtual` |
| Pagination fallback | Toggle between virtual scroll and paginated view (25–200 rows/page) |
| Multi-column sort | Click column header to cycle asc → desc → none; Shift+click for multi-sort |
| Filtering | Text contains filter; numeric min/max range filter; Clear filters button |
| CSV export | Exports currently filtered & sorted data |
| Unsaved changes | Browser `beforeunload` prompt when leaving with unsaved edits |
| State management | React Context + `useReducer` for centralized table state |

## Approach & Decisions

### Architecture

```
src/
├── context/TableContext.tsx    # Central state (useReducer)
├── components/EditableDataTable/
│   ├── EditableDataTable.tsx   # Main container
│   ├── VirtualTableBody.tsx    # Virtual scrolling
│   ├── PaginatedTableBody.tsx  # Pagination mode
│   ├── TableRow.tsx            # Row with edit actions
│   ├── EditableCell.tsx        # Inline cell editor
│   ├── TableHeader.tsx         # Sortable headers
│   ├── FilterBar.tsx           # Column filters
│   └── PaginationControls.tsx
├── utils/                      # Data generation, CSV, sort/filter helpers
├── hooks/                      # beforeunload prompt
└── types/                      # Shared TypeScript types
```

### Performance

- **Virtual scrolling** renders only visible rows (~15–25 DOM nodes) regardless of dataset size.
- **Memoized derived data** — filtering and sorting run in `useMemo`, not on every render.
- **Pagination mode** is offered as a fallback for users who prefer traditional paging or accessibility tooling that struggles with virtual lists.

### State management

Context + reducer keeps table logic in one place without Redux overhead. Edit state is tracked per row:

- `draft` — current in-progress values
- `original` — snapshot when edit started
- `history` — stack for undo

Only one row can be actively edited at a time to avoid conflicting saves.

### UI/UX

- Custom dark theme CSS (no heavy UI library) for fast load and full control.
- ARIA roles on table, rows, and cells; keyboard-accessible buttons and inputs.
- Visual cues: amber left border for dirty rows, blue tint for editing, unsaved banner.

## Usage Tips

1. Click **Edit** on a row (or double-click a cell) to start editing.
2. Modify fields, then **Save**, **Cancel**, or **Undo** (step-by-step revert).
3. Click column headers to sort; hold **Shift** and click for multi-column sort.
4. Use the filter bar; click **Clear filters** to reset.
5. Switch between **Virtual scroll** and **Pagination** in the toolbar.
6. **Export CSV** downloads the current filtered view.

## Known Limitations

- Only one row can be edited at a time.
- Undo history is capped at 20 steps per row.
- Filters apply to saved data, not in-progress drafts on other rows.
- CSV export includes filtered/sorted rows but not unsaved draft values.
- No server persistence — all data is client-side and resets on page reload.
- Virtual scroll horizontal overflow on very narrow screens requires horizontal scroll (min-width applied).

## Tech Stack

- React 18 + TypeScript
- Vite 5
- @tanstack/react-virtual 3

## License

MIT — created for technical assessment purposes.
