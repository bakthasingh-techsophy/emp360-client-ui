import React, { useState, useEffect, useRef } from 'react';
import { ToolbarConfig, ActiveFilter, DEFAULT_OPERATORS, FilterOperator } from './types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import {
  Search,
  SlidersHorizontal,
  Download,
  Settings2,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { FilterFieldRenderer } from './FilterFieldRenderer';
import { ExportDialog } from './ExportDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface GenericToolbarProps extends ToolbarConfig {
  className?: string;
}

export const GenericToolbar: React.FC<GenericToolbarProps> = ({
  className = '',
  showSearch = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showConfigureView = false,
  allColumns = [],
  visibleColumns = [],
  onVisibleColumnsChange,
  showExport = false,
  onExportAll,
  onExportResults,
  showFilters = false,
  availableFilters = [],
  activeFilters = [],
  onFiltersChange,
  customActions = [],
  showBulkActions = false,
  bulkActions = [],
  selectedCount = 0,
  onToggleSelection,
  selectionMode = false,
  showAddButton = false,
  addButtonLabel = 'Add',
  onAdd,
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'results' | 'selection'>('all');
  const [filterMode, setFilterMode] = useState<'basic' | 'advanced'>('basic');
  
  // Local state for pending changes
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [pendingFilters, setPendingFilters] = useState<ActiveFilter[]>(activeFilters || []);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle filter mode change and reset operators to default when switching to basic
  const handleFilterModeChange = (mode: 'basic' | 'advanced') => {
    setFilterMode(mode);
    
    if (mode === 'basic') {
      // Reset all operators to their defaults when switching to basic mode
      const updatedFilters = pendingFilters.map((filter) => {
        const filterDef = availableFilters.find(f => f.id === filter.filterId);
        if (!filterDef) return filter;
        
        const operators = filterDef.operators || DEFAULT_OPERATORS[filterDef.type];
        const defaultOperator = filterDef.defaultOperator || operators[0]?.value;
        
        return {
          ...filter,
          operator: defaultOperator as FilterOperator,
        };
      });
      
      setPendingFilters(updatedFilters);
      // Auto-apply the operator changes
      onFiltersChange?.(updatedFilters);
    }
  };

  // Sync external search value changes (e.g., when parent resets)
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Sync external filter changes (e.g., when parent resets)
  useEffect(() => {
    setPendingFilters(activeFilters || []);
  }, [activeFilters]);

  // Check if there are unapplied text-based filter changes
  const hasPendingTextFilters = pendingFilters.some((pf) => {
    const filterDef = availableFilters.find(f => f.id === pf.filterId);
    if (!filterDef || (filterDef.type !== 'text' && filterDef.type !== 'number' && filterDef.type !== 'numberrange')) return false;
    
    const appliedFilter = (activeFilters || []).find(af => af.filterId === pf.filterId);
    return JSON.stringify(pf.value) !== JSON.stringify(appliedFilter?.value);
  });

  // Check if there are unapplied changes
  const hasUnappliedSearchChange = localSearchValue !== searchValue;
  const hasUnappliedFilterChanges = JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters || []);
  const hasUnappliedTextChanges = hasUnappliedSearchChange || hasPendingTextFilters;

  // Handle search input change with debouncing
  const handleSearchInputChange = (value: string) => {
    setLocalSearchValue(value);
    
    // Clear existing debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new debounce timer (800ms delay)
    searchDebounceRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, 800);
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Clear debounce timer and apply immediately
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      onSearchChange?.(localSearchValue);
    }
  };

  // Apply all pending changes
  const handleApplyFilters = () => {
    // Apply search if changed
    if (hasUnappliedSearchChange) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      onSearchChange?.(localSearchValue);
    }
    
    // Apply filters if changed
    if (hasUnappliedFilterChanges) {
      onFiltersChange?.(pendingFilters);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const handleAddFilter = (filterId: string) => {
    if (!filterId) return;

    const filterDef = availableFilters.find(f => f.id === filterId);
    if (!filterDef) return;

    // Get available operators for this filter type
    const operators = filterDef.operators || DEFAULT_OPERATORS[filterDef.type];
    // Use defaultOperator if specified, otherwise use first available operator
    const defaultOperator = filterDef.defaultOperator || operators[0]?.value;

    const newFilter: ActiveFilter = {
      id: `filter-${Date.now()}`,
      filterId: filterId,
      operator: defaultOperator as FilterOperator,
      value: '',
    };

    setPendingFilters([...pendingFilters, newFilter]);
  };

  const handleRemoveFilter = (filterId: string) => {
    const updatedFilters = pendingFilters.filter((f) => f.id !== filterId);
    setPendingFilters(updatedFilters);
    // Apply the filter removal immediately
    onFiltersChange?.(updatedFilters);
  };

  const handleFilterValueChange = (filterId: string, value: any, filterType: string) => {
    // Update pending filters
    const updatedFilters = pendingFilters.map((f) => 
      f.id === filterId ? { ...f, value } : f
    );
    setPendingFilters(updatedFilters);

    // Auto-apply for non-text filters (select, multiselect, date, checkbox, number)
    if (filterType !== 'text') {
      // Apply immediately for selection-based filters
      onFiltersChange?.(updatedFilters);
      // Also apply search if there's an unapplied change
      if (hasUnappliedSearchChange) {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
        }
        onSearchChange?.(localSearchValue);
      }
    }
  };

  const handleOperatorChange = (filterId: string, operator: FilterOperator) => {
    // Update pending filters with new operator, retaining the existing value
    const updatedFilters = pendingFilters.map((f) => 
      f.id === filterId ? { ...f, operator } : f
    );
    setPendingFilters(updatedFilters);
    
    // Auto-apply the operator change with retained values
    onFiltersChange?.(updatedFilters);
    // Also apply search if there's an unapplied change
    if (hasUnappliedSearchChange) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      onSearchChange?.(localSearchValue);
    }
  };

  const handleClearAllFilters = () => {
    setPendingFilters([]);
    setLocalSearchValue('');
    // Apply immediately when clearing
    onSearchChange?.('');
    onFiltersChange?.([]);
  };

  // Get filters that are not yet active
  const availableFiltersToAdd = availableFilters.filter(
    (af) => !pendingFilters.some((active) => active.filterId === af.id)
  );

  const activeFilterCount = (activeFilters || []).filter((f) => {
    // For date filters with 'today' operator, no value needed
    if (f.operator === 'today') return true;
    
    // Regular filters - check if value is set
    if (f.value === null || f.value === undefined || f.value === '') return false;
    if (Array.isArray(f.value) && f.value.length === 0) return false;
    if (typeof f.value === 'object' && !Array.isArray(f.value)) {
      const rangeValue = f.value as { from?: any; to?: any; min?: any; max?: any };
      return !!(rangeValue.from || rangeValue.to || rangeValue.min || rangeValue.max);
    }
    return true;
  }).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Toolbar Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9"
            />
            {hasUnappliedSearchChange && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-600 dark:text-amber-500 font-medium">
                Press Enter
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Filters Button */}
          {showFilters && availableFilters.length > 0 && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {activeFilterCount}
                </span>
              )}
              {hasPendingTextFilters && (
                <span className="ml-1 bg-amber-500 text-white rounded-full w-2 h-2"></span>
              )}
              {filtersExpanded ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </Button>
          )}

          {/* Configure View Dropdown */}
          {showConfigureView && allColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Columns</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">Toggle Columns</div>
                <Separator className="my-1" />
                <div className="max-h-[300px] overflow-y-auto">
                  {allColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                      onClick={() => {
                        const newVisible = visibleColumns.includes(column.id)
                          ? visibleColumns.filter((id) => id !== column.id)
                          : [...visibleColumns, column.id];
                        onVisibleColumnsChange?.(newVisible);
                      }}
                    >
                      <Checkbox
                        id={`column-${column.id}`}
                        checked={visibleColumns.includes(column.id)}
                        onCheckedChange={(checked) => {
                          const newVisible = checked
                            ? [...visibleColumns, column.id]
                            : visibleColumns.filter((id) => id !== column.id);
                          onVisibleColumnsChange?.(newVisible);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`column-${column.id}`}
                        className="flex-1 cursor-pointer text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {column.label}
                      </label>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export Dropdown */}
          {showExport && (onExportAll || onExportResults) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExportAll && (
                  <DropdownMenuItem
                    onClick={() => {
                      setExportType('all');
                      setExportDialogOpen(true);
                    }}
                  >
                    Export All
                  </DropdownMenuItem>
                )}
                {onExportResults && (
                  <DropdownMenuItem
                    onClick={() => {
                      setExportType('results');
                      setExportDialogOpen(true);
                    }}
                  >
                    Export Results
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Add Button */}
          {showAddButton && onAdd && (
            <Button
              variant="default"
              className="gap-2"
              onClick={onAdd}
            >
              <span>{addButtonLabel}</span>
            </Button>
          )}

          {/* Selection Mode Toggle */}
          {showBulkActions && onToggleSelection && (
            <Button
              variant={selectionMode ? 'default' : 'outline'}
              className="gap-2"
              onClick={onToggleSelection}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">
                {selectionMode ? 'Cancel Selection' : 'Select Multiple'}
              </span>
            </Button>
          )}

          {/* Custom Actions */}
          {customActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
            >
              {action.icon}
              <span className={action.icon ? 'ml-2' : ''}>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && filtersExpanded && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-sm">Filters</h4>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={filterMode === 'basic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterModeChange('basic')}
                  className="h-7 rounded-r-none border-r"
                >
                  Basic
                </Button>
                <Button
                  variant={filterMode === 'advanced' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterModeChange('advanced')}
                  className="h-7 rounded-l-none"
                >
                  Advanced
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnappliedTextChanges && (
                <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                  Press Enter to apply
                </span>
              )}
              {hasUnappliedTextChanges && (
                <Button
                  size="sm"
                  onClick={handleApplyFilters}
                  className="gap-2 h-7"
                >
                  <Check className="h-3 w-3" />
                  Apply Filters
                </Button>
              )}
              {pendingFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {pendingFilters.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                {pendingFilters.map((activeFilter) => {
                  const filterDef = availableFilters.find((f) => f.id === activeFilter.filterId);
                  if (!filterDef) return null;

                  // Get available operators for this filter
                  const operators = filterDef.operators || DEFAULT_OPERATORS[filterDef.type];

                  // Get the effective operator (use default in basic mode if specified)
                  const effectiveOperator = filterMode === 'basic' && filterDef.defaultOperator
                    ? filterDef.defaultOperator
                    : activeFilter.operator;

                  return (
                    <div key={activeFilter.id} className="flex items-center gap-2">
                      {/* Filter Label */}
                      <div className="text-sm font-medium text-muted-foreground min-w-[120px]">
                        {filterDef.label}
                      </div>

                      {/* Operator Selector - Show in advanced mode for all fields, or in basic mode for date fields */}
                      {(filterMode === 'advanced' || filterDef.type === 'date') && (
                        <Select
                          value={activeFilter.operator}
                          onValueChange={(value) => handleOperatorChange(activeFilter.id, value as FilterOperator)}
                        >
                          <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Filter Value Input */}
                      <FilterFieldRenderer
                        filter={filterDef}
                        operator={effectiveOperator}
                        value={activeFilter.value}
                        onChange={(value) => handleFilterValueChange(activeFilter.id, value, filterDef.type)}
                        onEnterKey={handleApplyFilters}
                      />

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFilter(activeFilter.id)}
                        className="h-9 px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Add Filter Row */}
          {availableFiltersToAdd.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <Select value="" onValueChange={handleAddFilter}>
                  <SelectTrigger className="h-9 text-sm w-[200px]">
                    <SelectValue placeholder="Select filter to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFiltersToAdd.map((filter) => (
                      <SelectItem key={filter.id} value={filter.id}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Active Filter Count Display */}
      {activeFilterCount > 0 && !filtersExpanded && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-auto p-0 text-xs hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Bulk Actions Section */}
      {showBulkActions && selectedCount > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 flex-wrap">
                {bulkActions.map((action) => {
                  if (action.type === 'button') {
                    return (
                      <Button
                        key={action.id}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={() => action.onClick?.([])}
                        className="gap-2"
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    );
                  } else if (action.type === 'dropdown' && action.options) {
                    return (
                      <DropdownMenu key={action.id}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={action.variant || 'outline'}
                            size="sm"
                            className="gap-2"
                          >
                            {action.icon}
                            {action.label}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {action.options.map((option) => (
                            <DropdownMenuItem
                              key={option.id}
                              onClick={() => option.onClick([])}
                            >
                              {option.icon}
                              <span className={option.icon ? 'ml-2' : ''}>
                                {option.label}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        exportType={exportType}
        onExport={(sendEmail, email) => {
          if (exportType === 'all' && onExportAll) {
            onExportAll(sendEmail, email);
          } else if (exportType === 'results' && onExportResults) {
            onExportResults(sendEmail, email);
          }
        }}
      />
    </div>
  );
};
