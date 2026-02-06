/**
 * Employee Types Tab
 * Manage different employee types (Full-time, Part-time, Contract, etc.)
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { EmployeeType } from '../../types/settings.types';
import { useToast } from '@/hooks/use-toast';

// Zod schema for Employee Types form validation
const employeeTypeItemSchema = z.object({
  id: z.string().min(1, 'Code is required and cannot be empty'),
  description: z.string().min(1, 'Description is required and cannot be empty'),
});

const employeeTypesFormSchema = z.object({
  items: z.array(employeeTypeItemSchema).min(1, 'At least one employee type is required'),
});

type EmployeeTypesFormData = z.infer<typeof employeeTypesFormSchema>;

export function EmployeeTypesTab() {
  const { toast } = useToast();

  const form = useForm<EmployeeTypesFormData>({
    resolver: zodResolver(employeeTypesFormSchema),
    defaultValues: {
      items: [
        { id: 'FULL_TIME', description: 'Full-time' },
        { id: 'PART_TIME', description: 'Part-time' },
        { id: 'CONTRACT', description: 'Contract' },
        { id: 'INTERN', description: 'Intern' },
      ],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items');

  const columns: TableColumn<EmployeeType>[] = [
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
      placeholder: 'Enter employee type description...',
      flex: 1,
    },
  ];

  const emptyItem: EmployeeType = {
    id: '',
    description: '',
  };

  const handleItemsChange = (newItems: EmployeeType[]) => {
    // Transform code values to uppercase with underscores
    const transformedItems = newItems.map(item => ({
      ...item,
      id: item.id.toUpperCase().replace(/\s+/g, '_'),
    }));
    setValue('items', transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: EmployeeType, index: number) => {
    // Validate and submit single item
    const isValid = await form.trigger();
    if (isValid) {
      try {
        // TODO: Implement API call to save single employee type
        console.log('Saving employee type:', item, 'at index:', index);
        
        toast({
          title: 'Success',
          description: `Employee type "${item.description}" saved successfully`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save employee type',
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
            maxItems={20}
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
