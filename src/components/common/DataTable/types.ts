// DataTable Types - Framework-agnostic reusable table types

import { ColumnDef, SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';
import { ReactNode } from 'react';

/**
 * Pagination configuration for the table
 */
export interface PaginationConfig {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages?: number;
  /** Can navigate to next page */
  canNextPage?: boolean;
  /** Can navigate to previous page */
  canPreviousPage?: boolean;
  /** Total number of items */
  totalItems?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Callback when page changes */
  onPageChange: (pageIndex: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Pagination variant types
 */
export type PaginationVariant = 'default' | 'simple' | 'compact' | 'numbered' | 'custom';

/**
 * Custom pagination component props
 */
export interface CustomPaginationProps extends PaginationConfig {
  className?: string;
}

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
  /** Title to display when no data */
  title?: string;
  /** Description text */
  description?: string;
  /** Custom icon component */
  icon?: ReactNode;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Custom render function */
  render?: () => ReactNode;
}

/**
 * Loading state configuration
 */
export interface LoadingStateConfig {
  /** Loading message */
  message?: string;
  /** Custom loading component */
  render?: () => ReactNode;
}

/**
 * Selection configuration
 */
export interface SelectionConfig<TData> {
  /** Enable row selection */
  enabled: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Custom row ID accessor */
  getRowId?: (row: TData) => string;
  /** Enable select all */
  enableSelectAll?: boolean;
}

/**
 * Dialog configuration for delete confirmations
 */
export interface DeleteDialogConfig<TData> {
  /** Title of the delete dialog */
  title?: string;
  /** Custom description renderer */
  getDescription?: (item: TData) => string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
}

/**
 * Context interface for table operations
 * This allows tables to interact with backend/state management
 */
export interface DataTableContext<TData, TFilters = any> {
  /** Data items to display */
  data: TData[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error?: string | null;
  /** Refresh data with optional filters */
  refresh: (filters?: TFilters, page?: number, size?: number) => Promise<void>;
  /** Create new item */
  create?: (item: Partial<TData>) => Promise<TData>;
  /** Update existing item */
  update?: (id: string, item: Partial<TData>) => Promise<TData>;
  /** Delete item */
  delete?: (id: string) => Promise<void>;
  /** Bulk delete by IDs */
  bulkDelete?: (ids: string[]) => Promise<number>;
  /** Get item by ID */
  getById?: (id: string) => Promise<TData | null>;
}

/**
 * Main DataTable props
 */
export interface DataTableProps<TData, TFilters = any> {
  // Data & Context
  /** Table data source */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData, any>[];
  /** Context for table operations (optional) */
  context?: DataTableContext<TData, TFilters>;
  
  // State Management
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  
  // Pagination
  /** Pagination configuration */
  pagination?: PaginationConfig;
  /** Pagination variant */
  paginationVariant?: PaginationVariant;
  /** Fix pagination at bottom of viewport (default: false for inline) */
  fixedPagination?: boolean;
  /** Custom pagination component */
  customPaginationComponent?: React.ComponentType<CustomPaginationProps>;
  /** Enable server-side pagination */
  serverSidePagination?: boolean;
  
  // Features
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;
  /** Selection configuration */
  selection?: SelectionConfig<TData>;
  
  // Initial State
  /** Initial sorting state */
  initialSorting?: SortingState;
  /** Initial column filters */
  initialColumnFilters?: ColumnFiltersState;
  /** Initial column visibility */
  initialColumnVisibility?: VisibilityState;
  /** Initial page size */
  initialPageSize?: number;
  
  // Customization
  /** Empty state configuration */
  emptyState?: EmptyStateConfig;
  /** Loading state configuration */
  loadingState?: LoadingStateConfig;
  /** Delete dialog configuration */
  deleteDialog?: DeleteDialogConfig<TData>;
  /** Additional CSS classes */
  className?: string;
  /** Show table border */
  showBorder?: boolean;
  /** Striped rows */
  stripedRows?: boolean;
  /** Hover effect on rows */
  hoverEffect?: boolean;
  /** Dense/compact mode */
  dense?: boolean;
  
  // Callbacks
  /** Row click handler */
  onRowClick?: (row: TData) => void;
  /** Row double click handler */
  onRowDoubleClick?: (row: TData) => void;
  
  // Custom Renders
  /** Custom header component */
  renderHeader?: () => ReactNode;
  /** Custom footer component */
  renderFooter?: () => ReactNode;
  /** Custom row wrapper */
  renderRow?: (row: TData, children: ReactNode) => ReactNode;
  
  // Accessibility
  /** ARIA label for the table */
  ariaLabel?: string;
  /** ARIA description */
  ariaDescription?: string;
}

/**
 * Table ref methods for imperative actions
 */
export interface DataTableRef {
  /** Refresh table data */
  refresh: () => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Get selected row IDs */
  getSelectedIds: () => string[];
  /** Set page index */
  setPage: (pageIndex: number) => void;
  /** Set page size */
  setPageSize: (pageSize: number) => void;
}
