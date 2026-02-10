/**
 * Expense Types Tab
 * Manage expense types configuration
 * Integrated with ExpenseManagementContext for API operations
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { ExpenseTypeConfig } from '../../types/settings.types';
import { useToast } from '@/hooks/use-toast';
import { useExpenseManagement } from '@/contexts/ExpenseManagementContext';

const expenseTypeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
});

const expenseTypesFormSchema = z.object({
  items: z.array(expenseTypeSchema).min(1, 'At least one expense type is required'),
});

type ExpenseTypesFormData = z.infer<typeof expenseTypesFormSchema>;

export function ExpenseTypesTab() {
  const { toast } = useToast();
  const { listExpenseTypes, createExpenseType, deleteExpenseType, updateExpenseType } = useExpenseManagement();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const form = useForm<ExpenseTypesFormData>({
    resolver: zodResolver(expenseTypesFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items') as ExpenseTypeConfig[];

  // Load expense types on mount
  const loadExpenseTypes = async () => {
    setIsLoadingInitial(true);
    try {
      const types = await listExpenseTypes();
      if (types && types.length > 0) {
        setValue('items', types as any, { shouldValidate: false });
      } else {
        // If no types, start with one empty row
        setValue('items', [{ id: '', type: '', description: '' }] as any, { shouldValidate: false });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load expense types',
        variant: 'destructive',
      });
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  const columns: TableColumn<Record<string, any>>[] = [
    {
      key: 'type',
      header: 'Type',
      type: 'text',
      required: true,
      placeholder: 'Enter type...',
      width: '200px',
      minWidth: '200px',
    },
    {
      key: 'description',
      header: 'Description',
      type: 'text',
      required: true,
      placeholder: 'Enter description...',
      width: '300px',
      minWidth: '300px',
    },
  ];

  const handleSave = async () => {
    const valid = await form.trigger();
    if (!valid) return;

    try {
      // For new items (without ID), create them
      // For existing items, update them
      for (const item of items) {
        if (!item.id) {
          // Create new item
          const result = await createExpenseType({
            type: item.type,
            description: item.description,
          });
          if (!result) {
            throw new Error('Failed to create expense type');
          }
        } else {
          // Update existing item
          const result = await updateExpenseType(item.id, {
            type: item.type,
            description: item.description,
          });
          if (!result) {
            throw new Error('Failed to update expense type');
          }
        }
      }
      
      // Reload to get latest data with IDs
      await loadExpenseTypes();
      toast({
        title: 'Success',
        description: 'Expense types saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save expense types',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (item: Record<string, any>) => {
    try {
      if (item.id) {
        // Only delete if it has an ID (already saved to backend)
        const success = await deleteExpenseType(item.id);
        if (!success) {
          throw new Error('Failed to delete expense type');
        }
      }
      
      const filtered = items.filter((i) => i.id !== item.id);
      setValue('items', filtered as any);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete expense type',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form>
        {/* Centered Container - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading expense types...</p>
            </div>
          ) : (
            <EditableItemsTable
              columns={columns}
              items={items}
              onChange={(newData: any) => setValue('items', newData)}
              emptyItemTemplate={{ id: '', type: '', description: '' }}
              minItems={1}
              maxItems={20}
              showAddButton={true}
              allowRemove={true}
              allowAdd={true}
              allowSave={true}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
