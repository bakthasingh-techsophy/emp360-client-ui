/**
 * Expense Categories Tab
 * Manage expense categories configuration
 * Integrated with ExpenseManagementContext for API operations
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { ExpenseCategoryConfig } from '../../types/settings.types';
import { useToast } from '@/hooks/use-toast';
import { useExpenseManagement } from '@/contexts/ExpenseManagementContext';

const expenseCategorySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
});

const expenseCategoriesFormSchema = z.object({
  items: z.array(expenseCategorySchema).min(1, 'At least one expense category is required'),
});

type ExpenseCategoriesFormData = z.infer<typeof expenseCategoriesFormSchema>;

export function ExpenseCategoriesTab() {
  const { toast } = useToast();
  const { listExpenseCategories, createExpenseCategory, deleteExpenseCategory, updateExpenseCategory } = useExpenseManagement();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const form = useForm<ExpenseCategoriesFormData>({
    resolver: zodResolver(expenseCategoriesFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items') as ExpenseCategoryConfig[];

  // Load expense categories on mount
  const loadExpenseCategories = async () => {
    setIsLoadingInitial(true);
    try {
      const categories = await listExpenseCategories();
      if (categories && categories.length > 0) {
        setValue('items', categories as any, { shouldValidate: false });
      } else {
        // If no categories, start with one empty row
        setValue('items', [{ id: '', category: '', description: '' }] as any, { shouldValidate: false });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load expense categories',
        variant: 'destructive',
      });
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadExpenseCategories();
  }, []);

  const columns: TableColumn<Record<string, any>>[] = [
    {
      key: 'category',
      header: 'Category',
      type: 'text',
      required: true,
      placeholder: 'Enter category...',
      width: '180px',
      minWidth: '180px',
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
          const result = await createExpenseCategory({
            category: item.category,
            description: item.description,
          });
          if (!result) {
            throw new Error('Failed to create expense category');
          }
        } else {
          // Update existing item
          const result = await updateExpenseCategory(item.id, {
            category: item.category,
            description: item.description,
          });
          if (!result) {
            throw new Error('Failed to update expense category');
          }
        }
      }
      
      // Reload to get latest data with IDs
      await loadExpenseCategories();
      toast({
        title: 'Success',
        description: 'Expense categories saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save expense categories',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (item: Record<string, any>) => {
    try {
      if (item.id) {
        // Only delete if it has an ID (already saved to backend)
        const success = await deleteExpenseCategory(item.id);
        if (!success) {
          throw new Error('Failed to delete expense category');
        }
      }
      
      const filtered = items.filter((i) => i.id !== item.id);
      setValue('items', filtered as any);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete expense category',
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
              <p className="text-muted-foreground">Loading expense categories...</p>
            </div>
          ) : (
            <EditableItemsTable
              columns={columns}
              items={items}
              onChange={(newData: any) => setValue('items', newData)}
              emptyItemTemplate={{ id: '', category: '', description: '' }}
              minItems={1}
              maxItems={50}
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
