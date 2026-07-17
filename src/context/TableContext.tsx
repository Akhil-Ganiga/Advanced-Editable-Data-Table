import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  ColumnDef,
  Employee,
  FilterState,
  RowEditState,
  SortConfig,
  SortDirection,
  TableStats,
  ViewMode,
} from '../types/table.types';
import { applyFilters, applySorting, paginate, rowsEqual } from '../utils/tableHelpers';
import { generateEmployees } from '../utils/generateData';
import { useUnsavedChangesPrompt } from '../hooks/useUnsavedChangesPrompt';

export const EMPLOYEE_COLUMNS: ColumnDef<Employee>[] = [
  { key: 'id', label: 'ID', type: 'readonly', sortable: true, width: 70 },
  { key: 'name', label: 'Name', type: 'text', sortable: true, filterable: true, width: 180 },
  { key: 'email', label: 'Email', type: 'text', sortable: true, filterable: true, width: 240 },
  { key: 'department', label: 'Department', type: 'text', sortable: true, filterable: true, width: 140 },
  { key: 'salary', label: 'Salary', type: 'number', sortable: true, filterable: true, width: 120 },
  { key: 'quantity', label: 'Quantity', type: 'number', sortable: true, filterable: true, width: 110 },
];

const ROWS_COUNT = 10_000;
const DEFAULT_PAGE_SIZE = 50;

interface TableState {
  sourceData: Employee[];
  savedData: Employee[];
  editStates: Record<number, RowEditState<Employee>>;
  editingRowId: number | null;
  sortConfigs: SortConfig<Employee>[];
  filters: FilterState<Employee>;
  viewMode: ViewMode;
  page: number;
  pageSize: number;
}

type TableAction =
  | { type: 'START_EDIT'; rowId: number }
  | { type: 'UPDATE_DRAFT'; rowId: number; key: keyof Employee; value: string | number }
  | { type: 'SAVE_ROW'; rowId: number }
  | { type: 'CANCEL_ROW'; rowId: number }
  | { type: 'UNDO_ROW'; rowId: number }
  | { type: 'TOGGLE_SORT'; key: keyof Employee; multi: boolean }
  | { type: 'SET_FILTER'; key: keyof Employee; value: FilterState<Employee>[keyof Employee] }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGE_SIZE'; pageSize: number };

function getNextSortDirection(current?: SortDirection): SortDirection | null {
  if (!current) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

function createInitialState(): TableState {
  const data = generateEmployees(ROWS_COUNT);
  return {
    sourceData: data,
    savedData: data,
    editStates: {},
    editingRowId: null,
    sortConfigs: [],
    filters: {},
    viewMode: 'virtual',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case 'START_EDIT': {
      if (state.editingRowId != null && state.editingRowId !== action.rowId) {
        return state;
      }
      const row = state.savedData.find((r) => r.id === action.rowId);
      if (!row) return state;

      const existing = state.editStates[action.rowId];
      const editState: RowEditState<Employee> = existing ?? {
        draft: { ...row },
        original: { ...row },
        history: [],
      };

      return {
        ...state,
        editingRowId: action.rowId,
        editStates: { ...state.editStates, [action.rowId]: editState },
      };
    }

    case 'UPDATE_DRAFT': {
      const editState = state.editStates[action.rowId];
      if (!editState) return state;

      const currentValue = editState.draft[action.key];
      if (currentValue === action.value) return state;

      const history = [...editState.history, { ...editState.draft }].slice(-20);
      const updatedDraft = { ...editState.draft, [action.key]: action.value };
      return {
        ...state,
        editStates: {
          ...state.editStates,
          [action.rowId]: { ...editState, draft: updatedDraft, history },
        },
      };
    }

    case 'SAVE_ROW': {
      const editState = state.editStates[action.rowId];
      if (!editState) return state;

      const savedData = state.savedData.map((row) =>
        row.id === action.rowId ? { ...editState.draft } : row,
      );

      const { [action.rowId]: _, ...remainingEdits } = state.editStates;

      return {
        ...state,
        savedData,
        editStates: remainingEdits,
        editingRowId: state.editingRowId === action.rowId ? null : state.editingRowId,
      };
    }

    case 'CANCEL_ROW': {
      const editState = state.editStates[action.rowId];
      if (!editState) return state;

      const { [action.rowId]: _, ...remainingEdits } = state.editStates;

      return {
        ...state,
        editStates: remainingEdits,
        editingRowId: state.editingRowId === action.rowId ? null : state.editingRowId,
      };
    }

    case 'UNDO_ROW': {
      const editState = state.editStates[action.rowId];
      if (!editState || editState.history.length === 0) return state;

      const previous = editState.history[editState.history.length - 1];
      const history = editState.history.slice(0, -1);

      return {
        ...state,
        editStates: {
          ...state.editStates,
          [action.rowId]: { ...editState, draft: { ...previous }, history },
        },
      };
    }

    case 'TOGGLE_SORT': {
      const existingIndex = state.sortConfigs.findIndex((s) => s.key === action.key);
      const existing = existingIndex >= 0 ? state.sortConfigs[existingIndex] : undefined;
      const nextDirection = getNextSortDirection(existing?.direction);

      let sortConfigs: SortConfig<Employee>[];

      if (action.multi) {
        if (nextDirection == null) {
          sortConfigs = state.sortConfigs.filter((s) => s.key !== action.key);
        } else if (existingIndex >= 0) {
          sortConfigs = state.sortConfigs.map((s, i) =>
            i === existingIndex ? { ...s, direction: nextDirection } : s,
          );
        } else {
          sortConfigs = [...state.sortConfigs, { key: action.key, direction: nextDirection }];
        }
      } else {
        sortConfigs =
          nextDirection == null ? [] : [{ key: action.key, direction: nextDirection }];
      }

      return { ...state, sortConfigs, page: 1 };
    }

    case 'SET_FILTER': {
      const nextFilters = { ...state.filters };
      const isEmpty =
        action.value == null ||
        (typeof action.value === 'string' && !action.value.trim()) ||
        (typeof action.value === 'object' && Object.keys(action.value).length === 0);

      if (isEmpty) {
        delete nextFilters[action.key];
      } else {
        nextFilters[action.key] = action.value;
      }

      return { ...state, filters: nextFilters, page: 1 };
    }

    case 'CLEAR_FILTERS':
      return { ...state, filters: {}, page: 1 };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode, page: 1 };

    case 'SET_PAGE':
      return { ...state, page: action.page };

    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.pageSize, page: 1 };

    default:
      return state;
  }
}

interface TableContextValue {
  columns: ColumnDef<Employee>[];
  displayRows: Employee[];
  filteredRows: Employee[];
  sortConfigs: SortConfig<Employee>[];
  filters: FilterState<Employee>;
  editStates: Record<number, RowEditState<Employee>>;
  editingRowId: number | null;
  viewMode: ViewMode;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: TableStats;
  hasUnsavedChanges: boolean;
  hasActiveFilters: boolean;
  startEdit: (rowId: number) => void;
  updateDraft: (rowId: number, key: keyof Employee, value: string | number) => void;
  saveRow: (rowId: number) => void;
  cancelRow: (rowId: number) => void;
  undoRow: (rowId: number) => void;
  toggleSort: (key: keyof Employee, multi: boolean) => void;
  setFilter: (key: keyof Employee, value: FilterState<Employee>[keyof Employee]) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  getRowData: (rowId: number) => Employee;
  isRowDirty: (rowId: number) => boolean;
  canUndo: (rowId: number) => boolean;
}

const TableContext = createContext<TableContextValue | null>(null);

export function TableProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tableReducer, undefined, createInitialState);

  const filteredRows = useMemo(
    () => applySorting(applyFilters(state.savedData, state.filters), state.sortConfigs),
    [state.savedData, state.filters, state.sortConfigs],
  );

  const displayRows = useMemo(() => {
    if (state.viewMode === 'pagination') {
      return paginate(filteredRows, state.page, state.pageSize);
    }
    return filteredRows;
  }, [filteredRows, state.viewMode, state.page, state.pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / state.pageSize));

  const unsavedRowIds = useMemo(() => {
    return Object.entries(state.editStates)
      .filter(([, edit]) => !rowsEqual(edit.draft, edit.original))
      .map(([id]) => Number(id));
  }, [state.editStates]);

  const hasUnsavedChanges = unsavedRowIds.length > 0;

  useUnsavedChangesPrompt(hasUnsavedChanges);

  const getRowData = useCallback(
    (rowId: number): Employee => {
      const edit = state.editStates[rowId];
      if (edit) return edit.draft;
      return state.savedData.find((r) => r.id === rowId)!;
    },
    [state.editStates, state.savedData],
  );

  const isRowDirty = useCallback(
    (rowId: number) => unsavedRowIds.includes(rowId),
    [unsavedRowIds],
  );

  const canUndo = useCallback(
    (rowId: number) => (state.editStates[rowId]?.history.length ?? 0) > 0,
    [state.editStates],
  );

  const updateDraft = useCallback(
    (rowId: number, key: keyof Employee, value: string | number) => {
      dispatch({
        type: 'UPDATE_DRAFT',
        rowId,
        key,
        value,
      });
    },
    [],
  );

  const value = useMemo<TableContextValue>(
    () => ({
      columns: EMPLOYEE_COLUMNS,
      displayRows,
      filteredRows,
      sortConfigs: state.sortConfigs,
      filters: state.filters,
      editStates: state.editStates,
      editingRowId: state.editingRowId,
      viewMode: state.viewMode,
      page: state.page,
      pageSize: state.pageSize,
      totalPages,
      stats: {
        total: state.savedData.length,
        filtered: filteredRows.length,
        unsaved: unsavedRowIds.length,
      },
      hasUnsavedChanges,
      hasActiveFilters: Object.keys(state.filters).length > 0,
      startEdit: (rowId) => dispatch({ type: 'START_EDIT', rowId }),
      updateDraft,
      saveRow: (rowId) => dispatch({ type: 'SAVE_ROW', rowId }),
      cancelRow: (rowId) => dispatch({ type: 'CANCEL_ROW', rowId }),
      undoRow: (rowId) => dispatch({ type: 'UNDO_ROW', rowId }),
      toggleSort: (key, multi) => dispatch({ type: 'TOGGLE_SORT', key, multi }),
      setFilter: (key, value) => dispatch({ type: 'SET_FILTER', key, value }),
      clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),
      setViewMode: (mode) => dispatch({ type: 'SET_VIEW_MODE', mode }),
      setPage: (page) => dispatch({ type: 'SET_PAGE', page }),
      setPageSize: (pageSize) => dispatch({ type: 'SET_PAGE_SIZE', pageSize }),
      getRowData,
      isRowDirty,
      canUndo,
    }),
    [
      displayRows,
      filteredRows,
      state,
      totalPages,
      unsavedRowIds.length,
      hasUnsavedChanges,
      updateDraft,
      getRowData,
      isRowDirty,
      canUndo,
    ],
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTableContext(): TableContextValue {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error('useTableContext must be used within TableProvider');
  }
  return ctx;
}
