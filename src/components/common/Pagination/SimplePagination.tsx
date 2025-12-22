// Simple Pagination - Just prev/next buttons with minimal info

import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationProps } from './types';
import { useLayoutContext } from '@/contexts/LayoutContext';

export function SimplePagination({
  pageIndex,
  totalPages,
  canNextPage,
  onPageChange,
  className,
  disabled = false,
}: PaginationProps) {
  const { sidebarCollapsed } = useLayoutContext();
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
      {/* Page info */}
      <div className="text-sm text-muted-foreground">
        Page {pageIndex + 1} of {totalPages}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0 || disabled}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage || pageIndex >= totalPages - 1 || disabled}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
