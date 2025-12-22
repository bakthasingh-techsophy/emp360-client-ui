import { useState, useMemo, ReactNode } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Check, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DefaultPagination,
  CompactPagination,
  SimplePagination,
  NumberedPagination
} from '@/components/common/Pagination';

/**
 * Configuration for editable columns
 */
export interface EditableColumn<TData = any> {
  /** Unique key for the field */
  key: string;
  /** Column display label */
  label: string;
  /** TanStack Table column definition */
  columnDef: Omit<ColumnDef<TData>, 'id'>;
  /** Whether this field is required when adding/editing */
  required?: boolean;
  /** Placeholder text for input */
  placeholder?: string;
  /** Custom validation function */
  validate?: (value: any, allData: Record<string, any>) => string | undefined;
  /** Custom render function for edit mode */
  renderEdit?: (
    value: any,
    onChange: (value: any) => void,
    onKeyDown: (e: React.KeyboardEvent) => void,
    hasError: boolean
  ) => ReactNode;
}

/**
 * Row actions configuration
 */
export interface RowAction<TData = any> {
  /** Unique identifier for the action */
  id: string;
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Tooltip/title text */
  title: string;
  /** Click handler */
  onClick: (row: TData) => void;
  /** Optional: Check if action is visible for row */
  isVisible?: (row: TData) => boolean;
  /** Optional: Custom button class */
  className?: string;
}

/**
 * Props for EditableTable component
 */
export interface EditableTableProps<TData extends { id: string }> {
  /** Array of data items */
  data: TData[];
  /** Column configurations */
  columns: EditableColumn<TData>[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Enable inline editing (always enabled) */
  enableEdit?: boolean;
  /** Enable adding new rows */
  enableAdd?: boolean;
  /** Is currently in "add mode" */
  isAdding?: boolean;
  /** Custom row actions (e.g., delete, duplicate, etc.) */
  customActions?: RowAction<TData>[];
  
  // Handlers
  /** Update handler - called when a row is edited */
  onUpdate?: (id: string, data: Partial<TData>) => Promise<void>;
  /** Create handler - called when a new row is added */
  onCreate?: (data: Partial<TData>) => Promise<void>;
  /** Cancel add mode */
  onCancelAdd?: () => void;
  
  // Pagination
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /** Pagination variant: 'default' | 'compact' | 'simple' | 'numbered' | 'custom' */
  paginationVariant?: 'default' | 'compact' | 'simple' | 'numbered' | 'custom';
  /** Fix pagination at the bottom of the viewport */
  fixedPagination?: boolean;
  /** Custom pagination component */
  customPaginationComponent?: React.ComponentType<any>;
  /** Server-side pagination (disables built-in pagination) */
  serverSidePagination?: boolean;
  
  // Customization
  /** Custom class for table container */
  className?: string;
  /** Custom class for rows */
  rowClassName?: string | ((row: TData) => string);
  /** Custom add row background */
  addRowClassName?: string;
}

/**
 * Generic EditableTable Component
 * 
 * A reusable table component with inline editing, add, and delete functionality.
 * Supports custom columns, validation, keyboard shortcuts, and row actions.
 * 
 * @example
 * ```tsx
 * <EditableTable
 *   data={features}
 *   columns={[
 *     {
 *       key: 'name',
 *       label: 'Name',
 *       required: true,
 *       columnDef: { accessor: 'name', sortable: true }
 *     },
 *     {
 *       key: 'description',
 *       label: 'Description',
 *       columnDef: { accessor: 'description' }
 *     }
 *   ]}
 *   enableEdit
 *   enableDelete
 *   enableAdd
 *   isAdding={isAdding}
 *   onUpdate={handleUpdate}
 *   onCreate={handleCreate}
 *   onDelete={handleDelete}
 *   onCancelAdd={() => setIsAdding(false)}
 * />
 * ```
 */
export function EditableTable<TData extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found',
  enableEdit = true,
  enableAdd = true,
  isAdding = false,
  customActions = [],
  onUpdate,
  onCreate,
  onCancelAdd,
  pageIndex = 0,
  pageSize = 10,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
  paginationVariant = 'default',
  fixedPagination = false,
  customPaginationComponent,
  serverSidePagination = false,
  className,
  rowClassName,
  addRowClassName = 'bg-muted/20',
}: EditableTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, Record<string, any>>>({});
  const [addData, setAddData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  // Initialize add data structure
  const initializeAddData = () => {
    const initialData: Record<string, any> = {};
    columns.forEach((col) => {
      initialData[col.key] = '';
    });
    return initialData;
  };

  // Validation
  const validateField = (column: EditableColumn<TData>, value: any, allData: Record<string, any>): string | undefined => {
    // Required validation
    if (column.required) {
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      if (!trimmedValue) {
        return `${column.label} is required`;
      }
    }
    
    // Custom validation
    if (column.validate) {
      return column.validate(value, allData);
    }
    
    return undefined;
  };

  const validateAllFields = (dataToValidate: Record<string, any>, isEdit: boolean): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    columns.forEach((column) => {
      const error = validateField(column, dataToValidate[column.key], dataToValidate);
      if (error) {
        newErrors[column.key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      if (isEdit && editingId) {
        setErrors((prev) => ({ ...prev, [editingId]: newErrors }));
      } else {
        setErrors((prev) => ({ ...prev, add: newErrors }));
      }
    }

    return !hasErrors;
  };

  // Edit handlers
  const startEdit = (item: TData) => {
    const rowData: Record<string, any> = {};
    columns.forEach((col) => {
      rowData[col.key] = (item as any)[col.key] || '';
    });

    setEditingId(item.id);
    setEditingData({ ...editingData, [item.id]: rowData });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  const saveEdit = async (id: string) => {
    const dataToSave = editingData[id];
    if (!dataToSave) return;

    // Validate
    if (!validateAllFields(dataToSave, true)) {
      return;
    }

    // Trim strings
    const trimmedData: Record<string, any> = {};
    columns.forEach((col) => {
      const value = dataToSave[col.key];
      trimmedData[col.key] = typeof value === 'string' ? value.trim() : value;
    });

    try {
      await onUpdate?.(id, trimmedData as Partial<TData>);
      
      // Clear edit state
      const newEditingData = { ...editingData };
      delete newEditingData[id];
      setEditingData(newEditingData);
      
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
      
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update:', error);
      setErrors((prev) => ({
        ...prev,
        [id]: { _general: 'Failed to save. Please try again.' },
      }));
    }
  };

  const cancelEdit = () => {
    if (editingId) {
      const newData = { ...editingData };
      delete newData[editingId];
      setEditingData(newData);

      const newErrors = { ...errors };
      delete newErrors[editingId];
      setErrors(newErrors);
    }
    setEditingId(null);
  };

  // Add handlers
  const saveAdd = async () => {
    // Validate
    if (!validateAllFields(addData, false)) {
      return;
    }

    // Trim strings
    const trimmedData: Record<string, any> = {};
    columns.forEach((col) => {
      const value = addData[col.key];
      trimmedData[col.key] = typeof value === 'string' ? value.trim() : value;
    });

    try {
      await onCreate?.(trimmedData as Partial<TData>);
      setAddData(initializeAddData());
      setErrors((prev) => {
        const next = { ...prev };
        delete next.add;
        return next;
      });
      onCancelAdd?.();
    } catch (error) {
      console.error('Failed to create:', error);
      setErrors((prev) => ({
        ...prev,
        add: { _general: 'Failed to create. Please try again.' },
      }));
    }
  };

  const cancelAdd = () => {
    setAddData(initializeAddData());
    setErrors((prev) => {
      const next = { ...prev };
      delete next.add;
      return next;
    });
    onCancelAdd?.();
  };

  // Keyboard handlers
  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelAdd();
    }
  };

  // Build TanStack Table columns
  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    const cols: ColumnDef<TData>[] = columns.map((col) => ({
      ...col.columnDef,
      id: col.key,
      accessorKey: col.key,
      cell: ({ row, table }) => {
        const meta = table.options.meta as any;
        const isEditing = meta?.editingId === row.original.id;
        const rowData = meta?.editingData[row.original.id];
        const rowErrors = meta?.errors[row.original.id] || {};

        if (isEditing && rowData) {
          const value = rowData[col.key];
          const hasError = !!rowErrors[col.key];

          if (col.renderEdit) {
            return col.renderEdit(
              value,
              (newValue: any) => {
                meta?.setEditingData({
                  ...meta.editingData,
                  [row.original.id]: { ...rowData, [col.key]: newValue },
                });
                // Clear error on change
                if (hasError) {
                  meta?.setErrors((prev: any) => {
                    const next = { ...prev };
                    if (next[row.original.id]) {
                      delete next[row.original.id][col.key];
                    }
                    return next;
                  });
                }
              },
              (e: React.KeyboardEvent) => meta?.handleEditKeyDown(e, row.original.id),
              hasError
            );
          }

          return (
            <Input
              value={value}
              onChange={(e) => {
                meta?.setEditingData({
                  ...meta.editingData,
                  [row.original.id]: { ...rowData, [col.key]: e.target.value },
                });
                // Clear error on change
                if (hasError) {
                  meta?.setErrors((prev: any) => {
                    const next = { ...prev };
                    if (next[row.original.id]) {
                      delete next[row.original.id][col.key];
                    }
                    return next;
                  });
                }
              }}
              onKeyDown={(e) => meta?.handleEditKeyDown(e, row.original.id)}
              className={cn('h-8', hasError && 'border-red-500 focus-visible:ring-red-500')}
              placeholder={col.placeholder || `${col.label}${col.required ? ' (required)' : ''}`}
            />
          );
        }

        // Default cell rendering
        if (col.columnDef.cell && typeof col.columnDef.cell === 'function') {
          return col.columnDef.cell({ row, table } as any);
        }

        const cellValue = (row.original as any)[col.key];
        return <div>{cellValue || '-'}</div>;
      },
    }));

    // Add actions column (always present if edit is enabled or custom actions exist)
    if (enableEdit || customActions.length > 0) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row, table }) => {
          const meta = table.options.meta as any;
          const isEditing = meta?.editingId === row.original.id;

          if (isEditing) {
            return (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => meta?.saveEdit(row.original.id)}
                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  title="Save (Enter)"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={meta?.cancelEdit}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  title="Cancel (Esc)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-1">
              {/* Edit action (default) */}
              {enableEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(row.original)}
                  className="h-7 w-7 p-0 hover:bg-accent"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              
              {/* Custom actions (e.g., delete, duplicate, view, etc.) */}
              {customActions.map((action) => {
                const isVisible = action.isVisible ? action.isVisible(row.original) : true;
                if (!isVisible) return null;
                
                return (
                  <Button
                    key={action.id}
                    size="sm"
                    variant="ghost"
                    onClick={() => action.onClick(row.original)}
                    className={cn('h-7 w-7 p-0', action.className)}
                    title={action.title}
                  >
                    <action.icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          );
        },
      });
    }

    return cols;
  }, [columns, enableEdit, customActions, editingId]);

  // Initialize table
  const table = useReactTable({
    data,
    columns: tableColumns,
    meta: {
      editingId,
      editingData,
      errors,
      setEditingData,
      setErrors,
      saveEdit,
      cancelEdit,
      handleEditKeyDown,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      ...(serverSidePagination ? {} : {
        pagination: {
          pageIndex,
          pageSize,
        }
      }),
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    ...(serverSidePagination ? {
      manualPagination: true,
      pageCount: totalPages ?? -1,
    } : {}),
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Data Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* Add New Row */}
            {isAdding && enableAdd && (
              <TableRow className={addRowClassName}>
                {columns.map((col) => (
                  <TableCell key={col.key} className="py-2">
                    {col.renderEdit ? (
                      col.renderEdit(
                        addData[col.key] || '',
                        (newValue: any) => {
                          setAddData((prev) => ({ ...prev, [col.key]: newValue }));
                          // Clear error
                          setErrors((prev) => {
                            const next = { ...prev };
                            if (next.add) {
                              delete next.add[col.key];
                            }
                            return next;
                          });
                        },
                        handleAddKeyDown,
                        !!(errors.add && errors.add[col.key])
                      )
                    ) : (
                      <Input
                        value={addData[col.key] || ''}
                        onChange={(e) => {
                          setAddData((prev) => ({ ...prev, [col.key]: e.target.value }));
                          // Clear error
                          setErrors((prev) => {
                            const next = { ...prev };
                            if (next.add) {
                              delete next.add[col.key];
                            }
                            return next;
                          });
                        }}
                        onKeyDown={handleAddKeyDown}
                        className={cn(
                          'h-8',
                          errors.add && errors.add[col.key] && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        placeholder={col.placeholder || `${col.label}${col.required ? ' (required)' : ''}`}
                        autoFocus={col === columns[0]}
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={saveAdd}
                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Save (Enter)"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelAdd}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Cancel (Esc)"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Existing Rows */}
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const customRowClass =
                  typeof rowClassName === 'function' ? rowClassName(row.original) : rowClassName;
                return (
                  <TableRow key={row.id} className={cn('hover:bg-muted/30', customRowClass)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && (() => {
        if (customPaginationComponent) {
          const CustomPagination = customPaginationComponent;
          return (
            <CustomPagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalPages={totalPages ?? table.getPageCount()}
              canNextPage={table.getCanNextPage()}
              totalItems={totalItems}
              pageSizeOptions={pageSizeOptions}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange || (() => {})}
              className={fixedPagination ? 'fixed bottom-0 left-0 right-0 z-40 bg-background border-t' : undefined}
            />
          );
        }

        if (paginationVariant === 'custom') {
          return null; // User will provide their own pagination externally
        }

        const paginationProps = {
          pageIndex,
          pageSize,
          totalPages: totalPages ?? table.getPageCount(),
          canNextPage: table.getCanNextPage(),
          totalItems,
          pageSizeOptions,
          onPageChange,
          onPageSizeChange: onPageSizeChange || (() => {}),
          className: fixedPagination ? 'fixed bottom-0 left-0 right-0 z-40 bg-background border-t' : undefined,
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
      })()}
    </div>
  );
}
