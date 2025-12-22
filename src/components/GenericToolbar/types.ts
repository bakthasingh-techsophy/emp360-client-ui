import { ComparisonOp, CollectionOp, DateFilterType } from '@/types/search';

export type FilterFieldType = 
  | 'text'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'checkbox'
  | 'number'
  | 'numberrange'
  | 'boolean';

// Operator types based on field type
export type TextOperator = 'regex' | 'eq';
export type NumberOperator = ComparisonOp; // eq | lt | lte | gt | gte
export type SelectOperator = 'eq' | 'in';
export type MultiselectOperator = CollectionOp; // in | all | nin
export type BooleanOperator = 'eq' | 'exists';
export type DateOperator = DateFilterType; // on | >= | <= | today | between

export type FilterOperator = 
  | TextOperator 
  | NumberOperator 
  | SelectOperator 
  | MultiselectOperator 
  | BooleanOperator
  | DateOperator;

export interface FilterOption {
  value: string;
  label: string;
}

export interface OperatorOption {
  value: FilterOperator;
  label: string;
}

export interface AvailableFilter {
  id: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[];
  placeholder?: string;
  // Available operators for this filter type
  operators?: OperatorOption[];
  // Default operator if not specified
  defaultOperator?: FilterOperator;
}

export interface ActiveFilter {
  id: string;
  filterId: string;
  operator: FilterOperator;
  value: any;
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export type BulkActionType = 'button' | 'dropdown';

export interface BulkActionOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  type: BulkActionType;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  // For button type
  onClick?: (selectedIds: string[]) => void;
  // For dropdown type
  options?: BulkActionOption[];
}

export interface ToolbarConfig {
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  showConfigureView?: boolean;
  allColumns?: Array<{ id: string; label: string }>;
  visibleColumns?: string[];
  onVisibleColumnsChange?: (columns: string[]) => void;
  
  showExport?: boolean;
  onExportAll?: (sendEmail: boolean, email?: string) => void;
  onExportResults?: (sendEmail: boolean, email?: string) => void;
  
  showFilters?: boolean;
  availableFilters?: AvailableFilter[];
  activeFilters?: ActiveFilter[];
  onFiltersChange?: (filters: ActiveFilter[]) => void;
  
  customActions?: ToolbarAction[];
  
  // Bulk operations
  showBulkActions?: boolean;
  bulkActions?: BulkAction[];
  selectedCount?: number;
  onToggleSelection?: () => void;
  selectionMode?: boolean;
  
  // Add button
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAdd?: () => void;
}

// Default operators for each field type
export const DEFAULT_OPERATORS: Record<FilterFieldType, OperatorOption[]> = {
  text: [
    { value: 'regex', label: 'Contains' },
    { value: 'eq', label: 'Equals' },
  ],
  number: [
    { value: 'eq', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less or equal' },
  ],
  numberrange: [
    { value: 'gte', label: 'Between' },
  ],
  select: [
    { value: 'eq', label: 'Equals' },
  ],
  multiselect: [
    { value: 'in', label: 'Includes any' },
    { value: 'all', label: 'Includes all' },
    { value: 'nin', label: 'Excludes' },
  ],
  boolean: [
    { value: 'eq', label: 'Equals' },
    { value: 'exists', label: 'Exists' },
  ],
  checkbox: [
    { value: 'eq', label: 'Equals' },
  ],
  date: [
    { value: 'today', label: 'Today' },
    { value: 'on', label: 'On date' },
    { value: '>=', label: 'On or after' },
    { value: '<=', label: 'On or before' },
    { value: 'between', label: 'Between dates' },
  ],
};
