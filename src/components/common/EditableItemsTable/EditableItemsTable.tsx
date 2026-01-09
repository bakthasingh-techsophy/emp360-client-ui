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
import { Plus, Trash2, Paperclip } from 'lucide-react';
import { DocumentUploadModal } from '../DocumentUploadModal';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'select' | 'documents';
  width?: string;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[]; // For select type
  min?: number | string; // For number/date type (string for date inputs)
  max?: number | string;
  step?: number;
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
}: EditableItemsTableProps<T>) {
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

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
  };

  const handleOpenDocuments = (index: number) => {
    setSelectedItemIndex(index);
    setDocumentModalOpen(true);
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
      return (
        <Select
          value={value || ''}
          onValueChange={(newValue) => handleCellChange(index, column.key, newValue)}
        >
          <SelectTrigger className="h-8 text-sm">
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

    // Input columns (text, number, date)
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
        className="h-8 text-sm"
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
                  style={{ width: column.width }}
                  className="text-left"
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
                    <TableCell key={column.key}>
                      {renderCell(column, item, index)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
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
                          onClick={() => handleRemoveItem(index)}
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
