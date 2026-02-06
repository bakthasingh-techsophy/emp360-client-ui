/**
 * Departments Tab
 * Manage organizational departments
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { Department } from '../../types/settings.types';
import { useToast } from '@/hooks/use-toast';

// Zod schema for Departments form validation
const departmentItemSchema = z.object({
  id: z.string().min(1, 'Code is required and cannot be empty'),
  description: z.string().min(1, 'Description is required and cannot be empty'),
});

const departmentsFormSchema = z.object({
  items: z.array(departmentItemSchema).min(1, 'At least one department is required'),
});

type DepartmentsFormData = z.infer<typeof departmentsFormSchema>;

export function DepartmentsTab() {
  const { toast } = useToast();

  const form = useForm<DepartmentsFormData>({
    resolver: zodResolver(departmentsFormSchema),
    defaultValues: {
      items: [
        { id: 'ENGINEERING', description: 'Engineering' },
        { id: 'HUMAN_RESOURCES', description: 'Human Resources' },
        { id: 'FINANCE', description: 'Finance' },
        { id: 'MARKETING', description: 'Marketing' },
        { id: 'SALES', description: 'Sales' },
        { id: 'OPERATIONS', description: 'Operations' },
      ],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items');

  const columns: TableColumn<Department>[] = [
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
      placeholder: 'Enter department description...',
      flex: 1,
    },
  ];

  const emptyItem: Department = {
    id: '',
    description: '',
  };

  const handleItemsChange = (newItems: Department[]) => {
    // Transform code values to uppercase with underscores
    const transformedItems = newItems.map(item => ({
      ...item,
      id: item.id.toUpperCase().replace(/\s+/g, '_'),
    }));
    setValue('items', transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: Department, index: number) => {
    // Validate and submit single item
    const isValid = await form.trigger();
    if (isValid) {
      try {
        // TODO: Implement API call to save single department
        console.log('Saving department:', item, 'at index:', index);
        
        toast({
          title: 'Success',
          description: `Department "${item.description}" saved successfully`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save department',
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
