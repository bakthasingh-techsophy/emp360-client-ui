import React from 'react';
import { cn } from '@/lib/utils';
import { TimelineProps, TimelineTypeConfig } from './types';
import { Pagination } from '../common/Pagination';
import { Calendar } from 'lucide-react';

/**
 * Generic Timeline Component
 * 
 * A reusable component for displaying chronological sequences of events.
 * Similar to DataTable but for timeline views.
 * 
 * @example
 * ```tsx
 * const typeConfigs = [
 *   {
 *     type: 'appointment',
 *     renderer: (item, isLast) => <AppointmentCard {...item.data} />,
 *     icon: { component: Calendar },
 *     color: { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' }
 *   },
 *   {
 *     type: 'visit',
 *     renderer: (item, isLast) => <VisitCard {...item.data} />,
 *   }
 * ];
 * 
 * <Timeline
 *   items={items}
 *   typeConfigs={typeConfigs}
 *   showPagination
 *   paginationVariant="compact"
 * />
 * ```
 */
export function Timeline<T = any>({
  items,
  typeConfigs,
  showPagination = false,
  paginationVariant = 'compact',
  fixedPagination = false,
  pageIndex = 0,
  pageSize = 10,
  totalPages = 1,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  emptyMessage = 'No activities recorded yet',
  emptyIcon: EmptyIcon = Calendar,
  emptyState,
  isLoading = false,
  loadingState,
  className = '',
  autoSort = true,
  sortOrder = 'desc',
}: TimelineProps<T>) {
  // Sort items if autoSort is enabled
  const sortedItems = React.useMemo(() => {
    if (!autoSort) return items;
    
    return [...items].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [items, autoSort, sortOrder]);

  // Get renderer for a specific type
  const getTypeConfig = (type: string): TimelineTypeConfig<T> | undefined => {
    return typeConfigs.find(config => config.type === type);
  };

  // Loading state
  if (isLoading) {
    if (loadingState) {
      return <>{loadingState}</>;
    }
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (sortedItems.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <EmptyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Timeline items */}
      <div className="space-y-4">
        {sortedItems.map((item, idx) => {
          const isLast = idx === sortedItems.length - 1;
          const typeConfig = getTypeConfig(item.type);
          
          if (!typeConfig) {
            console.warn(`No renderer found for timeline item type: ${item.type}`);
            return null;
          }

          const Icon = typeConfig.icon?.component;
          const dotColor = typeConfig.color?.dot || 'bg-primary/10';
          const iconColor = typeConfig.color?.iconColor || 'text-primary';

          return (
            <div key={item.id} className="relative">
              {/* Timeline connector line */}
              {!isLast && (
                <div className="absolute left-[15px] top-[40px] bottom-[-16px] w-[2px] bg-border" />
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot with icon */}
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                    dotColor
                  )}
                >
                  {Icon && <Icon className={cn('h-4 w-4', iconColor)} />}
                </div>

                {/* Timeline item content */}
                <div className="flex-1 pb-4">
                  {typeConfig.renderer(item, isLast)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {showPagination && onPageChange && onPageSizeChange && (
        <Pagination
          variant={paginationVariant}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalPages={totalPages}
          canNextPage={pageIndex < totalPages - 1}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          totalItems={totalItems}
          pageSizeOptions={pageSizeOptions}
          className={fixedPagination ? 'fixed bottom-0 left-0 right-0 z-40' : undefined}
        />
      )}
    </div>
  );
}
