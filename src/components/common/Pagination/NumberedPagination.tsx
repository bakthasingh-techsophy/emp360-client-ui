// Numbered Pagination - Shows page number buttons

import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { PaginationProps } from './types';
import { useLayoutContext } from '@/contexts/LayoutContext';

export function NumberedPagination({
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
  const isFixed = className?.includes('fixed');
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);
      
      if (pageIndex <= 3) {
        // Near the beginning
        for (let i = 1; i < 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages - 1);
      } else if (pageIndex >= totalPages - 4) {
        // Near the end
        pages.push('ellipsis-start');
        for (let i = totalPages - 5; i < totalPages - 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages - 1);
      } else {
        // In the middle
        pages.push('ellipsis-start');
        for (let i = pageIndex - 1; i <= pageIndex + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems || (pageIndex + 1) * pageSize);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t bg-card px-4 py-3',
        isFixed && 'shadow-[0_-4px_6px_-1px_rgb(0_0_0_/0.1)] transition-[left] duration-200 ease-out lg:left-16',
        isFixed && !sidebarCollapsed && 'lg:left-64',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Top row - Info and page size */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalItems ? (
            <>
              Showing {startItem}-{endItem} of {totalItems} results
            </>
          ) : (
            <>
              Page {pageIndex + 1} of {totalPages}
            </>
          )}
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={disabled}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom row - Page numbers */}
      <div className="flex items-center justify-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0 || disabled}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) => {
          if (typeof page === 'string') {
            return (
              <Button
                key={`${page}-${idx}`}
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            );
          }

          return (
            <Button
              key={page}
              variant={page === pageIndex ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className={cn(
                'h-8 w-8',
                page === pageIndex && 'pointer-events-none'
              )}
            >
              {page + 1}
            </Button>
          );
        })}

        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage || pageIndex >= totalPages - 1 || disabled}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
