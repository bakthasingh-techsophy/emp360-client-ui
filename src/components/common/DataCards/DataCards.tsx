// DataCards - Reusable card-based data display component

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MoreVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataCardsProps, DataCardsRef } from './types';
import {
  DefaultPagination,
  CompactPagination,
  SimplePagination,
  NumberedPagination,
} from '../Pagination';

function DataCardsInner<TData, TFilters = any>(
  props: DataCardsProps<TData, TFilters>,
  ref: React.Ref<DataCardsRef>
) {
  const {
    data,
    contentFields,
    actions = [],
    context,
    loading = false,
    error = null,
    pagination,
    paginationVariant = 'default',
    fixedPagination = false,
    customPaginationComponent,
    selection,
    emptyState,
    loadingState,
    className,
    cardClassName,
    gridCols = { sm: 1, md: 2, lg: 3, xl: 4 },
    showBorder = true,
    hoverEffect = true,
    compact = false,
    renderHeader,
    renderFooter,
    ariaLabel,
    cardAnimation = '', // New prop for custom animations, default is no animation
    onCardClick,
    onCardDoubleClick,
  } = props;

  // Selection state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Clear selection when selection mode is disabled
  useEffect(() => {
    if (!selection?.enabled) {
      setRowSelection({});
    }
  }, [selection?.enabled]);

  // Notify parent of selection changes
  useEffect(() => {
    if (selection?.enabled && selection.onSelectionChange) {
      const selectedIds = Object.keys(rowSelection)
        .filter(key => rowSelection[key]);
      selection.onSelectionChange(selectedIds);
    }
  }, [rowSelection, selection]);

  // Get item ID
  const getItemId = (item: TData): string => {
    if (selection?.getItemId) {
      return selection.getItemId(item);
    }
    return (item as any).id || '';
  };

  // Handle card click for selection
  const handleCardClick = (itemId: string) => {
    setRowSelection((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (context?.refresh && pagination) {
        context.refresh(undefined, pagination.pageIndex, pagination.pageSize);
      }
    },
    clearSelection: () => setRowSelection({}),
    getSelectedIds: () => {
      return Object.keys(rowSelection)
        .filter(key => rowSelection[key]);
    },
    setPage: (pageIndex: number) => {
      if (pagination) {
        pagination.onPageChange(pageIndex);
      }
    },
    setPageSize: (pageSize: number) => {
      if (pagination) {
        pagination.onPageSizeChange(pageSize);
      }
    },
  }));

  // Render empty state
  const renderEmptyState = () => {
    if (emptyState?.render) {
      return emptyState.render();
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        {emptyState?.icon && <div className="text-4xl">{emptyState.icon}</div>}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {emptyState?.title || 'No data available'}
          </p>
          {emptyState?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {emptyState.description}
            </p>
          )}
        </div>
        {emptyState?.action && (
          <button
            onClick={emptyState.action.onClick}
            className="mt-2 text-sm text-primary hover:underline"
          >
            {emptyState.action.label}
          </button>
        )}
      </div>
    );
  };

  // Render loading state
  const renderLoadingState = () => {
    if (loadingState?.render) {
      return loadingState.render();
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        {loadingState?.message || 'Loading...'}
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null;

    if (customPaginationComponent) {
      const CustomPagination = customPaginationComponent;
      return <CustomPagination {...pagination} />;
    }

    if (paginationVariant === 'custom') {
      return null;
    }

    const paginationProps = {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      totalPages: pagination.totalPages || 1,
      canNextPage: pagination.canNextPage || false,
      totalItems: pagination.totalItems,
      pageSizeOptions: pagination.pageSizeOptions ?? [6, 12, 24, 48],
      onPageChange: pagination.onPageChange,
      onPageSizeChange: pagination.onPageSizeChange,
      className: fixedPagination ? 'fixed bottom-0 left-0 right-0 z-40' : undefined,
    };

    switch (paginationVariant) {
      case 'compact':
        return <CompactPagination {...paginationProps} />;
      case 'simple':
        return <SimplePagination {...paginationProps} />;
      case 'numbered':
        return <NumberedPagination {...paginationProps} />;
      case 'default':
      default:
        return <DefaultPagination {...paginationProps} />;
    }
  };

  // Render card actions
  const renderCardActions = (item: TData) => {
    // Separate actions: max 3 in button row, rest in menu
    const visibleActions = actions.slice(0, 3);
    const menuActions = actions.slice(3);

    return (
      <div className="flex items-center gap-2">
        {/* Visible action buttons */}
        {visibleActions.map((action) => {
          const isDisabled = action.disabled?.(item) ?? false;
          const truncatedLabel = action.label.length > 12 ? action.label.substring(0, 12) + '...' : action.label;

          return (
            <TooltipProvider key={action.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={() => action.onClick(item)}
                    disabled={isDisabled}
                    className="flex-1 min-w-max text-xs"
                    aria-label={action.label}
                  >
                    {action.icon && <span className="h-4 w-4 mr-1">{action.icon}</span>}
                    {truncatedLabel}
                  </Button>
                </TooltipTrigger>
                {action.label.length > 12 && (
                  <TooltipContent>
                    <p>{action.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {/* More menu for additional actions */}
        {menuActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
                aria-label="More actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menuActions.map((action) => {
                const isDisabled = action.disabled?.(item) ?? false;

                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => !isDisabled && action.onClick(item)}
                    disabled={isDisabled}
                    className={cn(
                      'cursor-pointer',
                      action.variant === 'destructive' && 'text-destructive'
                    )}
                  >
                    {action.icon && <span className="h-4 w-4 mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  // Grid columns class generator
  const getGridColsClass = () => {
    const cols = gridCols;
    return cn(
      'grid gap-4',
      cols.sm && `grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`
    );
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Custom Header */}
      {renderHeader && renderHeader()}

      {/* Cards Grid */}
      {loading ? (
        renderLoadingState()
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : data.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div
            className={getGridColsClass()}
            role="grid"
            aria-label={ariaLabel || 'Data cards'}
          >
            {data.map((item) => {
              const itemId = getItemId(item);
              const isSelected = rowSelection[itemId as keyof typeof rowSelection] ?? false;

              return (
                <Card
                  key={itemId}
                  className={cn(
                    'overflow-hidden transition-all cursor-pointer',
                    showBorder && 'border',
                    hoverEffect && 'hover:shadow-lg hover:scale-[1.02]',
                    compact && 'p-3',
                    !compact && 'p-4',
                    cardClassName,
                    cardAnimation && cardAnimation,
                    isSelected && 'ring-2 ring-primary'
                  )}
                  onClick={() => {
                    // If selection mode is enabled, toggle selection on card click
                    if (selection?.enabled) {
                      handleCardClick(itemId);
                      return;
                    }
                    // Otherwise, forward to consumer click handler
                    onCardClick?.(item as TData);
                  }}
                  onDoubleClick={() => {
                    if (!selection?.enabled) {
                      onCardDoubleClick?.(item as TData);
                    }
                  }}
                  role="gridcell"
                  aria-selected={isSelected}
                >
                  {/* Selection Box (visual only) */}
                  {selection?.enabled && (
                    <div
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCardClick(itemId);
                        }
                      }}
                      className={cn(
                        'mb-2 inline-flex items-center justify-center w-5 h-5 border-2 rounded-sm transition-all',
                      )}
                      aria-label={`Select ${itemId}`}
                    >
                      {isSelected && (
                        <Check 
                          className="h-3 w-3 flex-shrink-0" 
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  )}

                  {/* Content Fields */}
                  <div className={cn('space-y-3', compact && 'space-y-2')}>
                    {contentFields.map((field) => (
                      <div key={field.id} className={field.fullWidth ? 'w-full' : undefined}>
                        {field.label && !field.fullWidth && (
                          <p className={cn('text-xs font-semibold text-muted-foreground uppercase tracking-wider')}>
                            {field.label}
                          </p>
                        )}
                        <div className={cn(field.fullWidth ? 'w-full' : 'text-sm', !field.fullWidth && compact && 'text-xs')}>
                          {field.render(item)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Row */}
                  {actions.length > 0 && (
                    <div className={cn('mt-4 pt-4 border-t', compact && 'mt-3 pt-3')}>
                      {renderCardActions(item)}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Custom Footer */}
      {renderFooter && renderFooter()}
    </div>
  );
}

export const DataCards = forwardRef(DataCardsInner) as <TData, TFilters = any>(
  props: DataCardsProps<TData, TFilters> & { ref?: React.Ref<DataCardsRef> }
) => ReturnType<typeof DataCardsInner>;
