// Compact Pagination - Minimal inline design

import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationProps } from './types';
import { useLayoutContext } from '@/contexts/LayoutContext';

export function CompactPagination({
  pageIndex,
  pageSize,
  totalPages,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [10, 20, 50],
  className,
  disabled = false,
}: PaginationProps) {
  const { sidebarCollapsed } = useLayoutContext();
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems || (pageIndex + 1) * pageSize);
  
  const isFixed = className?.includes('fixed');

  return (
    <div
      className={cn(
        'flex items-center justify-between border-t bg-card px-4 py-3',
        isFixed && 'shadow-[0_-4px_6px_-1px_rgb(0_0_0_/0.1)] transition-[left] duration-200 ease-out lg:left-16',
        isFixed && !sidebarCollapsed && 'lg:left-64',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Left side - Items info */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {totalItems ? (
            <>
              Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
              <span className="font-medium text-foreground">{endItem}</span> of{' '}
              <span className="font-medium text-foreground">{totalItems}</span> results
            </>
          ) : (
            <>
              Page <span className="font-medium text-foreground">{pageIndex + 1}</span> of{' '}
              <span className="font-medium text-foreground">{totalPages}</span>
            </>
          )}
        </div>

        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={disabled}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(0)}
          disabled={pageIndex === 0 || disabled}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0 || disabled}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage || pageIndex >= totalPages - 1 || disabled}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canNextPage || pageIndex >= totalPages - 1 || disabled}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-3" />
        </Button>
      </div>
    </div>
  );
}
