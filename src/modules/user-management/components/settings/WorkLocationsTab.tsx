/**
 * Work Locations Tab
 * Manage office locations and remote work settings
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { WorkLocation, WorkLocationCarrier } from '../../types/settings.types';
import { useUserManagement } from '@/contexts/UserManagementContext';

// Zod schema for Work Locations form validation
const workLocationItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  location: z.string().min(1, 'Location is required and cannot be empty'),
  description: z.string().min(1, 'Description is required and cannot be empty'),
});

const workLocationsFormSchema = z.object({
  items: z.array(workLocationItemSchema).min(1, 'At least one work location is required'),
});

type WorkLocationsFormData = z.infer<typeof workLocationsFormSchema>;

export function WorkLocationsTab() {
  const { createWorkLocation, updateWorkLocation, refreshWorkLocations, deleteWorkLocation } = useUserManagement();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const form = useForm<WorkLocationsFormData>({
    resolver: zodResolver(workLocationsFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items');

  // Load work locations on mount
  const loadWorkLocations = async () => {
    setIsLoadingInitial(true);
    const result = await refreshWorkLocations({}, 0, 100);
    if (result?.content) {
      setValue('items', result.content, { shouldValidate: false });
    } else {
      // Fallback to default values if no data
      setValue('items', [
        { id: 'LOC_001', location: 'Bangalore', description: 'Bangalore' },
        { id: 'LOC_002', location: 'Hyderabad', description: 'Hyderabad' },
        { id: 'LOC_003', location: 'Pune', description: 'Pune' },
        { id: 'LOC_004', location: 'Mumbai', description: 'Mumbai' },
        { id: 'LOC_005', location: 'Remote', description: 'Remote' },
      ]);
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadWorkLocations();
  }, []);

  const columns: TableColumn<WorkLocation>[] = [
    {
      key: 'location',
      header: 'Location',
      type: 'text',
      required: true,
      placeholder: 'Enter location...',
      width: '250px',
      minWidth: '250px',
    },
    {
      key: 'description',
      header: 'Description',
      type: 'text',
      required: true,
      placeholder: 'Enter location description...',
      flex: 1,
    },
  ];

  const emptyItem: WorkLocation = {
    id: '',
    location: '',
    description: '',
  };

  const handleItemsChange = (newItems: WorkLocation[]) => {
    // Transform location values to uppercase with underscores
    const transformedItems = newItems.map(item => ({
      ...item,
      location: item.location.toUpperCase().replace(/\s+/g, '_'),
    }));
    setValue('items', transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: WorkLocation, index: number) => {
    console.log('handleSave called for item:', item, 'at index:', index);

    // Validate current item has required fields
    if (!item.location || !item.description) {
      console.warn('Validation failed: missing required fields');
      return;
    }

    try {
      // Check if this is an existing item (has a valid ID from server)
      const isExistingItem = item.id && item.id.trim() !== '';

      if (isExistingItem) {
        // Update existing work location
        console.log('Updating work location with ID:', item.id);

        const updatePayload = {
          location: item.location,
          description: item.description,
          updatedAt: new Date().toISOString(),
        };

        console.log('Calling updateWorkLocation with payload:', updatePayload);

        const result = await updateWorkLocation(item.id, updatePayload);

        console.log('API result:', result);

        if (result) {
          // Update the item with any returned data
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue('items', updatedItems);
          console.log('Item updated successfully:', result);
        }
      } else {
        // Create new work location
        const itemId = `LOC_${Date.now()}`;

        console.log('Creating work location with ID:', itemId);

        const carrier: WorkLocationCarrier = {
          id: itemId,
          location: item.location,
          description: item.description,
          createdAt: new Date().toISOString(),
        };

        console.log('Calling createWorkLocation with carrier:', carrier);

        const result = await createWorkLocation(carrier);

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
      console.error('Error saving work location:', error);
    }
  };

  const handleDelete = async (item: WorkLocation, index: number) => {
    console.log('handleDelete called for item:', item, 'at index:', index);

    try {
      if (!item.id || item.id.trim() === '') {
        console.warn('Cannot delete item without ID');
        return;
      }

      const success = await deleteWorkLocation(item.id);

      if (success) {
        // Remove the item from the form state
        const updatedItems = items.filter((_: any, i: number) => i !== index);
        setValue('items', updatedItems, { shouldValidate: true });
        console.log('Work location deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting work location:', error);
    }
  };

  return (
    <Form {...form}>
      <form>
        {/* Centered Container - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading work locations...</p>
            </div>
          ) : (
            <EditableItemsTable
              columns={columns}
              items={items}
              onChange={handleItemsChange}
              emptyItemTemplate={emptyItem}
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
