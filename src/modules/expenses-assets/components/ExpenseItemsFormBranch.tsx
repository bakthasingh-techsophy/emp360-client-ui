/**
 * Expense Items Form Branch
 * Child form component for expense line items
 */

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable/EditableItemsTable';
import { ExpenseFormData, ExpenseLineItem } from '../types/expense.types';
import { format } from 'date-fns';

interface ExpenseItemsFormBranchProps {
  form: UseFormReturn<ExpenseFormData>;
  mode: 'create' | 'edit';
}

export function ExpenseItemsFormBranch({ form }: ExpenseItemsFormBranchProps) {
  const { watch, setValue } = form;
  const lineItems = watch('lineItems') || [];
  const expenseType = watch('type');

  const columns: TableColumn<ExpenseLineItem>[] = [
    {
      key: 'category',
      header: 'Category',
      type: 'select',
      options: [
        { label: 'Travel', value: 'travel' },
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'Meals', value: 'meals' },
        { label: 'Transport', value: 'transport' },
        { label: 'Office Supplies', value: 'office_supplies' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Training', value: 'training' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
      minWidth: '160px',
    },
    {
      key: 'description',
      header: 'Description',
      type: 'text',
      required: true,
      flex: 1,
    },
    {
      key: 'fromDate',
      header: 'From Date',
      type: 'date',
      required: true,
      minWidth: '140px',
    },
    {
      key: 'toDate',
      header: 'To Date',
      type: 'date',
      required: true,
      minWidth: '140px',
    },
    {
      key: 'amount',
      header: 'Amount',
      type: 'number',
      required: true,
      align: 'right',
      minWidth: '120px',
    },
    {
      key: 'attachments',
      header: 'Documents',
      type: 'documents',
      minWidth: '120px',
    },
  ];

  const handleItemsChange = (items: ExpenseLineItem[]) => {
    setValue('lineItems', items, { shouldValidate: true });
  };

  const handleDocumentsChange = (itemIndex: number, files: File[]) => {
    const updatedItems = [...lineItems];
    // Convert File objects to ExpenseAttachment format
    const newAttachments = files.map(file => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      attachments: newAttachments,
    };
    setValue('lineItems', updatedItems, { shouldValidate: true });
  };

  const getDocuments = (_itemIndex: number): File[] => {
    // Return empty array as we're storing as ExpenseAttachment objects
    // The EditableItemsTable will handle the display
    return [];
  };

  const createEmptyItem = (): ExpenseLineItem => ({
    id: `temp-${Date.now()}`,
    category: 'travel',
    description: '',
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    attachments: [],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {expenseType === 'advance' ? 'Advance Request Items' : 'Expense Items'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EditableItemsTable
          columns={columns as any}
          items={lineItems as any}
          onChange={handleItemsChange as any}
          emptyItemTemplate={createEmptyItem() as any}
          minItems={1}
          onDocumentsChange={handleDocumentsChange}
          getDocuments={getDocuments}
        />
      </CardContent>
    </Card>
  );
}
