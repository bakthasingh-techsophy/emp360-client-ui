/**
 * Designations Tab
 * Manage job titles and designations
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { Designation, DesignationCarrier } from '../../types/settings.types';
import { useUserManagement } from '@/contexts/UserManagementContext';

// Zod schema for Designations form validation
const designationItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  designation: z.string().min(1, 'Designation is required and cannot be empty'),
  description: z.string().min(1, 'Description is required and cannot be empty'),
});

const designationsFormSchema = z.object({
  items: z.array(designationItemSchema).min(1, 'At least one designation is required'),
});

type DesignationsFormData = z.infer<typeof designationsFormSchema>;

export function DesignationsTab() {
  const { createDesignation, updateDesignation, refreshDesignations, deleteDesignation } = useUserManagement();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const form = useForm<DesignationsFormData>({
    resolver: zodResolver(designationsFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items');

  // Load designations on mount
  const loadDesignations = async () => {
    setIsLoadingInitial(true);
    const result = await refreshDesignations({}, 0, 100);
    if (result?.content) {
      setValue('items', result.content, { shouldValidate: false });
    } else {
      // Fallback to default values if no data
      setValue('items', [
        { id: 'DES_001', designation: 'Software Engineer', description: 'Software Engineer' },
        { id: 'DES_002', designation: 'Senior Software Engineer', description: 'Senior Software Engineer' },
        { id: 'DES_003', designation: 'Tech Lead', description: 'Tech Lead' },
        { id: 'DES_004', designation: 'Manager', description: 'Manager' },
        { id: 'DES_005', designation: 'Senior Manager', description: 'Senior Manager' },
      ]);
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const columns: TableColumn<Designation>[] = [
    {
      key: 'designation',
      header: 'Designation',
      type: 'text',
      required: true,
      placeholder: 'Enter designation...',
      width: '250px',
      minWidth: '250px',
    },
    {
      key: 'description',
      header: 'Description',
      type: 'text',
      required: true,
      placeholder: 'Enter designation description...',
      flex: 1,
    },
  ];

  const emptyItem: Designation = {
    id: '',
    designation: '',
    description: '',
  };

  const handleItemsChange = (newItems: Designation[]) => {
    // Transform designation values to uppercase with underscores
    const transformedItems = newItems.map(item => ({
      ...item,
      designation: item.designation.toUpperCase().replace(/\s+/g, '_'),
    }));
    setValue('items', transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: Designation, index: number) => {
    console.log('handleSave called for item:', item, 'at index:', index);

    // Validate current item has required fields
    if (!item.designation || !item.description) {
      console.warn('Validation failed: missing required fields');
      return;
    }

    try {
      // Check if this is an existing item (has a valid ID from server)
      const isExistingItem = item.id && item.id.trim() !== '';

      if (isExistingItem) {
        // Update existing designation
        console.log('Updating designation with ID:', item.id);

        const updatePayload = {
          designation: item.designation,
          description: item.description,
          updatedAt: new Date().toISOString(),
        };

        console.log('Calling updateDesignation with payload:', updatePayload);

        const result = await updateDesignation(item.id, updatePayload);

        console.log('API result:', result);

        if (result) {
          // Update the item with any returned data
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue('items', updatedItems);
          console.log('Item updated successfully:', result);
        }
      } else {
        // Create new designation
        const itemId = `DES_${Date.now()}`;

        console.log('Creating designation with ID:', itemId);

        const carrier: DesignationCarrier = {
          id: itemId,
          designation: item.designation,
          description: item.description,
          createdAt: new Date().toISOString(),
        };

        console.log('Calling createDesignation with carrier:', carrier);

        const result = await createDesignation(carrier);

        console.log('API result:', result);

        if (result) {
          // Update the item with any returned data
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue('items', updatedItems);
          console.log('Item created successfully:', result);
        }
      }
    } catch (error) {
      console.error('Error saving designation:', error);
    }
  };

  const handleDelete = async (item: Designation, index: number) => {
    console.log('handleDelete called for item:', item, 'at index:', index);

    try {
      if (!item.id || item.id.trim() === '') {
        console.warn('Cannot delete item without ID');
        return;
      }

      const success = await deleteDesignation(item.id);

      if (success) {
        // Remove the item from the form state
        const updatedItems = items.filter((_: any, i: number) => i !== index);
        setValue('items', updatedItems, { shouldValidate: true });
        console.log('Designation deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting designation:', error);
    }
  };

  return (
    <Form {...form}>
      <form>
        {/* Centered Container - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading designations...</p>
            </div>
          ) : (
            <EditableItemsTable
              columns={columns}
              items={items}
              onChange={handleItemsChange}
              emptyItemTemplate={emptyItem}
              minItems={1}
              maxItems={100}
              showAddButton={true}
              allowRemove={true}
              allowAdd={true}
              allowSave={true}
              onSave={handleSave}              onDelete={handleDelete}            />
          )}
        </div>
      </form>
    </Form>
  );
}
