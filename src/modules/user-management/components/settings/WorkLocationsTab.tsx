/**
 * Work Locations Tab
 * Manage office locations and remote work settings
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { WorkLocation } from '../../types/settings.types';
import { useToast } from '@/hooks/use-toast';

// Zod schema for Work Locations form validation
const workLocationItemSchema = z.object({
  id: z.string().min(1, 'Code is required and cannot be empty'),
  description: z.string().min(1, 'Description is required and cannot be empty'),
});

const workLocationsFormSchema = z.object({
  items: z.array(workLocationItemSchema).min(1, 'At least one work location is required'),
});

type WorkLocationsFormData = z.infer<typeof workLocationsFormSchema>;

export function WorkLocationsTab() {
  const { toast } = useToast();

  const form = useForm<WorkLocationsFormData>({
    resolver: zodResolver(workLocationsFormSchema),
    defaultValues: {
      items: [
        { id: 'BANGALORE', description: 'Bangalore' },
        { id: 'HYDERABAD', description: 'Hyderabad' },
        { id: 'PUNE', description: 'Pune' },
        { id: 'MUMBAI', description: 'Mumbai' },
        { id: 'REMOTE', description: 'Remote' },
      ],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items');

  const columns: TableColumn<WorkLocation>[] = [
    {
      key: 'id',
      header: 'Code',
      type: 'text',
      required: true,
      placeholder: 'Enter unique code...',
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
    description: '',
  };

  const handleItemsChange = (newItems: WorkLocation[]) => {
    // Transform code values to uppercase with underscores
    const transformedItems = newItems.map(item => ({
      ...item,
      id: item.id.toUpperCase().replace(/\s+/g, '_'),
    }));
    setValue('items', transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: WorkLocation, index: number) => {
    // Validate and submit single item
    const isValid = await form.trigger();
    if (isValid) {
      try {
        // TODO: Implement API call to save single work location
        console.log('Saving work location:', item, 'at index:', index);
        
        toast({
          title: 'Success',
          description: `Work location "${item.description}" saved successfully`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save work location',
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form>
        {/* Centered Container - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
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
          />
        </div>
      </form>
    </Form>
  );
}
