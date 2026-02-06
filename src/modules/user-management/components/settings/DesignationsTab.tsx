/**
 * Designations Tab
 * Manage job titles and designations
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { Designation } from '../../types/settings.types';
import { useToast } from '@/hooks/use-toast';

// Zod schema for Designations form validation
const designationItemSchema = z.object({
  id: z.string().min(1, 'Code is required and cannot be empty'),
  description: z.string().min(1, 'Description is required and cannot be empty'),
});

const designationsFormSchema = z.object({
  items: z.array(designationItemSchema).min(1, 'At least one designation is required'),
});

type DesignationsFormData = z.infer<typeof designationsFormSchema>;

export function DesignationsTab() {
  const { toast } = useToast();

  const form = useForm<DesignationsFormData>({
    resolver: zodResolver(designationsFormSchema),
    defaultValues: {
      items: [
        { id: 'SOFTWARE_ENGINEER', description: 'Software Engineer' },
        { id: 'SENIOR_SOFTWARE_ENGINEER', description: 'Senior Software Engineer' },
        { id: 'TECH_LEAD', description: 'Tech Lead' },
        { id: 'MANAGER', description: 'Manager' },
        { id: 'SENIOR_MANAGER', description: 'Senior Manager' },
      ],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items');

  const columns: TableColumn<Designation>[] = [
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
      placeholder: 'Enter designation description...',
      flex: 1,
    },
  ];

  const emptyItem: Designation = {
    id: '',
    description: '',
  };

  const handleItemsChange = (newItems: Designation[]) => {
    // Transform code values to uppercase with underscores
    const transformedItems = newItems.map(item => ({
      ...item,
      id: item.id.toUpperCase().replace(/\s+/g, '_'),
    }));
    setValue('items', transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: Designation, index: number) => {
    // Validate and submit single item
    const isValid = await form.trigger();
    if (isValid) {
      try {
        // TODO: Implement API call to save single designation
        console.log('Saving designation:', item, 'at index:', index);
        
        toast({
          title: 'Success',
          description: `Designation "${item.description}" saved successfully`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save designation',
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
            maxItems={100}
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
