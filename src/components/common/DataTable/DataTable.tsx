// DataTable - Reusable table component built on TanStack Table

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataTableProps, DataTableRef } from './types';
import { 
  DefaultPagination,
  CompactPagination, 
  SimplePagination, 
  NumberedPagination
} from '../Pagination';

function DataTableInner<TData, TFilters = any>(
  props: DataTableProps<TData, TFilters>,
  ref: React.Ref<DataTableRef>
) {
  const {
    data,
    columns,
    context,
    loading = false,
    error = null,
    pagination,
    paginationVariant = 'default',
    fixedPagination = false,
    customPaginationComponent,
    serverSidePagination = false,
    enableSorting = true,
    enableFiltering = true,
    enableColumnVisibility = true,
    selection,
    initialSorting = [],
    initialColumnFilters = [],
    initialColumnVisibility = {},
    initialPageSize = 10,
    emptyState,
    loadingState,
    className,
    showBorder = true,
    stripedRows = false,
    hoverEffect = true,
    dense = false,
    onRowClick,
    onRowDoubleClick,
    renderHeader,
    renderFooter,
    ariaLabel,
  } = props;

  // Table state
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = useState({});

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
        .filter(key => rowSelection[key as keyof typeof rowSelection])
        .map(key => {
          const index = parseInt(key);
          const row = data[index];
          return selection.getRowId ? selection.getRowId(row) : (row as any).id;
        })
        .filter(Boolean);
      selection.onSelectionChange(selectedIds);
    }
  }, [rowSelection, data, selection]);

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
    onRowSelectionChange: selection?.enabled ? setRowSelection : undefined,
    getRowId: selection?.getRowId ? selection.getRowId : (row: any) => row.id,
    enableRowSelection: selection?.enabled ?? false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(pagination && !serverSidePagination ? {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }
      } : {}),
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    ...(serverSidePagination ? {
      manualPagination: true,
      pageCount: pagination?.totalPages ?? -1,
    } : {}),
  });

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
        .filter(key => rowSelection[key as keyof typeof rowSelection])
        .map(key => {
          const index = parseInt(key);
          const row = data[index];
          return selection?.getRowId ? selection.getRowId(row) : (row as any).id;
        })
        .filter(Boolean);
    },
    setPage: (pageIndex: number) => {
      if (pagination) {
        pagination.onPageChange(pageIndex);
      } else if (!serverSidePagination) {
        table.setPageIndex(pageIndex);
      }
    },
    setPageSize: (pageSize: number) => {
      if (pagination) {
        pagination.onPageSizeChange(pageSize);
      } else if (!serverSidePagination) {
        table.setPageSize(pageSize);
      }
    },
  }));

  // Render empty state
  const renderEmptyState = () => {
    if (emptyState?.render) {
      return emptyState.render();
    }

    return (
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className="h-32 text-center"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            {emptyState?.icon}
            <div>
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
        </TableCell>
      </TableRow>
    );
  };

  // Render loading state
  const renderLoadingState = () => {
    if (loadingState?.render) {
      return loadingState.render();
    }

    return (
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className="h-32 text-center text-muted-foreground"
        >
          {loadingState?.message || 'Loading...'}
        </TableCell>
      </TableRow>
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
      return null; // User will provide their own pagination externally
    }

    // Use variant-based pagination components
    const paginationProps = {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      totalPages: pagination.totalPages ?? table.getPageCount(),
      canNextPage: pagination.canNextPage ?? table.getCanNextPage(),
      totalItems: pagination.totalItems,
      pageSizeOptions: pagination.pageSizeOptions ?? [5, 10, 25, 50, 100],
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

  return (
    <div className={cn('flex flex-col', showBorder && 'rounded-lg border bg-card', className)}>
      {/* Custom Header */}
      {renderHeader && renderHeader()}

      {/* Table */}
      <div className="relative w-full overflow-x-auto">
        <Table noWrapper aria-label={ariaLabel}>
          <TableHeader className="bg-background border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn(dense && 'py-2')}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              renderLoadingState()
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    hoverEffect && 'hover:bg-muted/30',
                    stripedRows && index % 2 === 1 && 'bg-muted/10',
                    onRowClick && 'cursor-pointer',
                    dense && 'h-10'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                  onDoubleClick={() => onRowDoubleClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(dense && 'py-2')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              renderEmptyState()
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Custom Footer */}
      {renderFooter && renderFooter()}
    </div>
  );
}

export const DataTable = forwardRef(DataTableInner) as <TData, TFilters = any>(
  props: DataTableProps<TData, TFilters> & { ref?: React.Ref<DataTableRef> }
) => ReturnType<typeof DataTableInner>;
