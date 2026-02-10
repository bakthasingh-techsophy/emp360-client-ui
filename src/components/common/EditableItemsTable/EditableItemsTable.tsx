/**
 * Editable Items Table Component
 * Reusable table for collecting multiple line items with inline editing
 * Features: Add/Remove rows, inline cell editing, document upload modal
 */

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Trash2, Paperclip, CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DocumentUploadModal } from './DocumentUploadModal';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'documents';
  width?: string;
  minWidth?: string; // Minimum width for the column
  maxWidth?: string; // Maximum width for the column
  flex?: number; // Flex grow factor (e.g., 1 for flex-1)
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[]; // For select/multiselect type
  min?: number | string; // For number/date type (string for date inputs)
  max?: number | string;
  step?: number;
  align?: 'left' | 'center' | 'right'; // Text alignment for header and cell
  render?: (value: any, item: T) => React.ReactNode; // Custom render function
  validate?: (value: any) => string | null; // Custom validation
}

export interface EditableItemsTableProps<T = any> {
  columns: TableColumn<T>[];
  items: T[];
  onChange: (items: T[]) => void;
  emptyItemTemplate: T; // Template for new items
  minItems?: number; // Minimum number of items
  maxItems?: number; // Maximum number of items
  onDocumentsChange?: (itemIndex: number, documents: File[]) => void;
  getDocuments?: (itemIndex: number) => File[];
  className?: string;
  showAddButton?: boolean; // Show add button in header
  allowRemove?: boolean; // Allow removing items
  allowAdd?: boolean; // Allow adding items
  allowSave?: boolean; // Show save button for each row
  onSave?: (item: T, index: number) => void | Promise<void>; // Callback when save is clicked for an item
  onDelete?: (item: T, index: number) => void | Promise<void>; // Callback when delete is clicked for an item
  errors?: Record<number, Record<string, string>>; // Validation errors by row index and column key
  onValidate?: (items: T[]) => Record<number, Record<string, string>>; // Optional validation function
  onMultiselectClick?: (columnKey: string, index: number, currentValue: string[]) => void; // Callback when multiselect button is clicked
}

export function EditableItemsTable<T extends Record<string, any>>({
  columns,
  items,
  onChange,
  emptyItemTemplate,
  minItems = 1,
  maxItems = 50,
  onDocumentsChange,
  getDocuments,
  className = '',
  showAddButton = true,
  allowRemove = true,
  allowAdd = true,
  allowSave = false,
  onSave,
  onDelete,
  errors = {},
  onValidate,
  onMultiselectClick,
}: EditableItemsTableProps<T>) {
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const handleAddItem = () => {
    if (items.length >= maxItems) return;
    onChange([...items, { ...emptyItemTemplate }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= minItems) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleCellChange = (index: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
    // Trigger validation if provided
    if (onValidate) {
      onValidate(newItems);
    }
  };

  const handleOpenDocuments = (index: number) => {
    setSelectedItemIndex(index);
    setDocumentModalOpen(true);
  };

  const handleSave = async (item: T, index: number) => {
    if (onSave) {
      setSavingIndex(index);
      try {
        await onSave(item, index);
      } finally {
        setSavingIndex(null);
      }
    }
  };

  const handleDocumentsSave = (documents: File[]) => {
    if (selectedItemIndex !== null && onDocumentsChange) {
      onDocumentsChange(selectedItemIndex, documents);
    }
    setDocumentModalOpen(false);
    setSelectedItemIndex(null);
  };

  const renderCell = (column: TableColumn<T>, item: T, index: number) => {
    const value = item[column.key];

    // Custom render function
    if (column.render) {
      return column.render(value, item);
    }

    // Document column
    if (column.type === 'documents') {
      const docs = getDocuments ? getDocuments(index) : [];
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleOpenDocuments(index)}
          className="gap-2"
        >
          <Paperclip className="h-4 w-4" />
          {docs.length > 0 ? `${docs.length} file${docs.length > 1 ? 's' : ''}` : 'Upload'}
        </Button>
      );
    }

    // Select column
    if (column.type === 'select') {
      const hasError = errors[index]?.[column.key];
      return (
        <Select
          value={value || ''}
          onValueChange={(newValue) => handleCellChange(index, column.key, newValue)}
        >
          <SelectTrigger className={cn(
            "h-8 text-sm w-full",
            hasError && 'border-red-500 focus:ring-red-500'
          )}>
            <SelectValue placeholder={column.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {column.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Multiselect column (array of selected values) - shown as button with count, opens modal via callback
    if (column.type === 'multiselect') {
      const hasError = errors[index]?.[column.key];
      const selectedValues = Array.isArray(value) ? value : [];
      
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onMultiselectClick?.(column.key, index, selectedValues)}
          className={cn(
            'h-8 text-sm w-full justify-start text-left font-normal gap-2',
            !selectedValues.length && 'text-muted-foreground',
            hasError && 'border-red-500 focus-visible:ring-red-500'
          )}
        >
          {selectedValues.length > 0 ? `${selectedValues.length} selected` : column.placeholder || 'Select...'}
        </Button>
      );
    }

    // Date column with shadcn date picker
    if (column.type === 'date') {
      const dateValue = value ? new Date(value) : undefined;
      const hasError = errors[index]?.[column.key];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'h-8 text-sm w-full justify-start text-left font-normal',
                !dateValue && 'text-muted-foreground',
                hasError && 'border-red-500 focus-visible:ring-red-500'
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {dateValue ? format(dateValue, 'MMM dd, yyyy') : column.placeholder || 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => {
                const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                handleCellChange(index, column.key, dateString);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    }

    // Input columns (text, number)
    const hasError = errors[index]?.[column.key];
    return (
      <Input
        type={column.type}
        value={value || ''}
        onChange={(e) => {
          const newValue = column.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
          handleCellChange(index, column.key, newValue);
        }}
        placeholder={column.placeholder}
        min={column.min}
        max={column.max}
        step={column.step}
        className={cn(
          'h-8 text-sm',
          column.type === 'number' && 'w-24',
          hasError && 'border-red-500 focus-visible:ring-red-500'
        )}
        required={column.required}
      />
    );
  };

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ 
                    width: column.flex ? undefined : (column.width || '1%'),
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                  className={cn(
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    !column.align && 'text-left'
                  )}
                >
                  {column.header}
                  {column.required && <span className="text-red-500 ml-1">*</span>}
                </TableHead>
              ))}
              <TableHead className="w-24 text-center">
                {showAddButton && allowAdd && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={items.length >= maxItems}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                  No items added. Click the + button to add an item.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key}
                      style={{ 
                        width: column.flex ? undefined : '1%',
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth
                      }}
                      className={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        !column.align && 'text-left'
                      )}
                    >
                      {renderCell(column, item, index)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      {allowSave && onSave && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(item, index)}
                          disabled={savingIndex === index}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Save item"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {allowAdd && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleAddItem}
                          disabled={items.length >= maxItems}
                          className="h-8 w-8 p-0"
                          title="Add item"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {allowRemove && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (onDelete) {
                              onDelete(items[index], index);
                            } else {
                              handleRemoveItem(index);
                            }
                          }}
                          disabled={items.length <= minItems}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentUploadModal
        open={documentModalOpen}
        onOpenChange={setDocumentModalOpen}
        documents={selectedItemIndex !== null && getDocuments ? getDocuments(selectedItemIndex) : []}
        onSave={handleDocumentsSave}
        maxFiles={10}
        acceptedFormats={['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx']}
      />
    </div>
  );
}
