// Default Pagination - Full-featured with fixed position (existing TablePagination)

import { useLayoutContext } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { PaginationProps } from './types';

export function DefaultPagination({
  pageIndex,
  pageSize,
  totalPages,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className,
  disabled = false,
}: PaginationProps) {
  const { sidebarCollapsed } = useLayoutContext();
  const isFixed = className?.includes('fixed');

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-6 bg-card px-4 py-3 border-t",
        isFixed && "shadow-[0_-4px_6px_-1px_rgb(0_0_0_/0.1)] transition-[left] duration-200 ease-out lg:left-16",
        isFixed && !sidebarCollapsed && "lg:left-64",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Rows per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top" align="start">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page info and navigation */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {totalPages}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0 || disabled}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canNextPage || pageIndex >= totalPages - 1 || disabled}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
