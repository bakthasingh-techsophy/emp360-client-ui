import { ReactNode } from 'react';
import { PaginationVariant } from '../common/Pagination/types';

/**
 * Generic timeline item structure
 */
export interface TimelineItem<T = any> {
  /** Unique identifier for the item */
  id: string;
  /** Type of the item (e.g., 'appointment', 'visit', 'event') */
  type: string;
  /** Timestamp for sorting and display */
  timestamp: Date;
  /** The actual data */
  data: T;
}

/**
 * Timeline item renderer function
 * Returns the React element to render for a specific item type
 */
export type TimelineItemRenderer<T = any> = (
  item: TimelineItem<T>,
  isLast: boolean
) => ReactNode;

/**
 * Timeline configuration for different item types
 */
export interface TimelineTypeConfig<T = any> {
  /** Type identifier (should match TimelineItem.type) */
  type: string;
  /** Custom renderer for this type */
  renderer: TimelineItemRenderer<T>;
  /** Optional icon configuration */
  icon?: {
    component: any; // Lucide icon component
    className?: string;
  };
  /** Optional color scheme */
  color?: {
    dot: string; // Tailwind classes for dot background
    iconColor: string; // Tailwind classes for icon color
  };
}

/**
 * Timeline component props
 */
export interface TimelineProps<T = any> {
  /** Array of timeline items to display */
  items: TimelineItem<T>[];
  
  /** Configuration for different item types */
  typeConfigs: TimelineTypeConfig<T>[];
  
  /** Whether to show pagination */
  showPagination?: boolean;
  
  /** Pagination variant to use */
  paginationVariant?: PaginationVariant;
  
  /** Whether pagination should be fixed at bottom (like DataTable) */
  fixedPagination?: boolean;
  
  /** Current page index (0-based) */
  pageIndex?: number;
  
  /** Items per page */
  pageSize?: number;
  
  /** Total number of pages */
  totalPages?: number;
  
  /** Total number of items */
  totalItems?: number;
  
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  
  /** Available page size options */
  pageSizeOptions?: number[];
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Empty state icon */
  emptyIcon?: any;
  
  /** Custom empty state renderer */
  emptyState?: ReactNode;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Custom loading state */
  loadingState?: ReactNode;
  
  /** Optional CSS class name */
  className?: string;
  
  /** Whether to sort items by timestamp (default: true, descending) */
  autoSort?: boolean;
  
  /** Sort order (default: 'desc') */
  sortOrder?: 'asc' | 'desc';
}
