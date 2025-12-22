// Pagination component types

export interface PaginationProps {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page available */
  canNextPage: boolean;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (size: number) => void;
  /** Optional total items count */
  totalItems?: number;
  /** Optional available page size options */
  pageSizeOptions?: number[];
  /** Optional CSS class name */
  className?: string;
  /** Whether pagination is disabled */
  disabled?: boolean;
}

export type PaginationVariant = 
  | 'default'      // Full-featured with fixed position (current TablePagination)
  | 'compact'      // Minimal design, inline
  | 'simple'       // Just prev/next buttons
  | 'numbered';    // Shows page numbers

export interface PaginationVariantProps extends PaginationProps {
  /** Variant style */
  variant?: PaginationVariant;
}
