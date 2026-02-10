// DataCards Types - Card-based data display component

import { ReactNode } from 'react';

/**
 * Pagination configuration for the cards
 */
export interface CardPaginationConfig {
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
export type CardPaginationVariant = 'default' | 'simple' | 'compact' | 'numbered' | 'custom';

/**
 * Custom pagination component props
 */
export interface CustomCardPaginationProps extends CardPaginationConfig {
  className?: string;
}

/**
 * Card content field definition
 */
export interface CardContentField<TData> {
  /** Unique field identifier */
  id: string;
  /** Display label */
  label?: string;
  /** Custom render function for content */
  render: (item: TData) => ReactNode;
  /** Whether this field should take full card width (for component-based content) */
  fullWidth?: boolean;
}

/**
 * Card action button definition
 */
export interface CardAction<TData> {
  /** Unique action identifier */
  id: string;
  /** Display label (will be truncated with ellipsis) */
  label: string;
  /** Icon component */
  icon?: ReactNode;
  /** Action handler */
  onClick: (item: TData) => void;
  /** Action variant (default, destructive, etc.) */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  /** Whether to show in more menu instead of button row (auto if > 3 actions) */
  showInMenu?: boolean;
  /** Disable action */
  disabled?: (item: TData) => boolean;
}

/**
 * Empty state configuration
 */
export interface CardEmptyStateConfig {
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
export interface CardLoadingStateConfig {
  /** Loading message */
  message?: string;
  /** Custom loading component */
  render?: () => ReactNode;
}

/**
 * Selection configuration
 */
export interface CardSelectionConfig<TData> {
  /** Enable item selection */
  enabled: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Custom item ID accessor */
  getItemId?: (item: TData) => string;
  /** Enable select all */
  enableSelectAll?: boolean;
}

/**
 * Context interface for card operations
 */
export interface DataCardsContext<TData, TFilters = any> {
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
 * Main DataCards props
 */
export interface DataCardsProps<TData, TFilters = any> {
  // Data & Context
  /** Card data source */
  data: TData[];
  /** Content field definitions */
  contentFields: CardContentField<TData>[];
  /** Action definitions */
  actions?: CardAction<TData>[];
  /** Context for card operations (optional) */
  context?: DataCardsContext<TData, TFilters>;

  // State Management
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;

  // Pagination
  /** Pagination configuration */
  pagination?: CardPaginationConfig;
  /** Pagination variant */
  paginationVariant?: CardPaginationVariant;
  /** Fix pagination at bottom of viewport */
  fixedPagination?: boolean;
  /** Custom pagination component */
  customPaginationComponent?: React.ComponentType<CustomCardPaginationProps>;
  /** Enable server-side pagination */
  serverSidePagination?: boolean;

  // Features
  /** Selection configuration */
  selection?: CardSelectionConfig<TData>;

  // Customization
  /** Empty state configuration */
  emptyState?: CardEmptyStateConfig;
  /** Loading state configuration */
  loadingState?: CardLoadingStateConfig;
  /** Additional CSS classes */
  className?: string;
  /** Card container CSS classes */
  cardClassName?: string;
  /** Grid columns (responsive) */
  gridCols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Show card border */
  showBorder?: boolean;
  /** Hover effect on cards */
  hoverEffect?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Card animation */
  cardAnimation?: string; // New prop for custom animations, default is no animation

  // Callbacks
  /** Card click handler */
  onCardClick?: (item: TData) => void;
  /** Card double click handler */
  onCardDoubleClick?: (item: TData) => void;

  // Custom Renders
  /** Custom header component */
  renderHeader?: () => ReactNode;
  /** Custom footer component */
  renderFooter?: () => ReactNode;

  // Accessibility
  /** ARIA label for the card container */
  ariaLabel?: string;
}

/**
 * DataCards ref methods for imperative actions
 */
export interface DataCardsRef {
  /** Refresh card data */
  refresh: () => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Get selected item IDs */
  getSelectedIds: () => string[];
  /** Set page index */
  setPage: (pageIndex: number) => void;
  /** Set page size */
  setPageSize: (pageSize: number) => void;
}
