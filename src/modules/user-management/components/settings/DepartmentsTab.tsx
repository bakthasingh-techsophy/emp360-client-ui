/**
 * Departments Tab
 * Manage organizational departments
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Form } from '@/components/ui/form';
import { Department, DepartmentCarrier } from '../../types/settings.types';
import { useUserManagement } from '@/contexts/UserManagementContext';

// Zod schema for Departments form validation
const departmentItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  department: z.string().min(1, 'Department is required and cannot be empty'),
  description: z.string().min(1, 'Description is required and cannot be empty'),
});

const departmentsFormSchema = z.object({
  items: z.array(departmentItemSchema).min(1, 'At least one department is required'),
});

type DepartmentsFormData = z.infer<typeof departmentsFormSchema>;

export function DepartmentsTab() {
  const { createDepartment, updateDepartment, refreshDepartments, deleteDepartment } = useUserManagement();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const form = useForm<DepartmentsFormData>({
    resolver: zodResolver(departmentsFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { watch, setValue } = form;
  const items = watch('items');

  // Load departments on mount
  const loadDepartments = async () => {
    setIsLoadingInitial(true);
    const result = await refreshDepartments({}, 0, 100);
    if (result?.content) {
      setValue('items', result.content, { shouldValidate: false });
    } else {
      // Fallback to default values if no data
      setValue('items', [
        { id: 'DEPT_001', department: 'Engineering', description: 'Engineering' },
        { id: 'DEPT_002', department: 'Human Resources', description: 'Human Resources' },
        { id: 'DEPT_003', department: 'Finance', description: 'Finance' },
        { id: 'DEPT_004', department: 'Marketing', description: 'Marketing' },
        { id: 'DEPT_005', department: 'Sales', description: 'Sales' },
        { id: 'DEPT_006', department: 'Operations', description: 'Operations' },
      ]);
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const columns: TableColumn<Department>[] = [
    {
      key: 'department',
      header: 'Department',
      type: 'text',
      required: true,
      placeholder: 'Enter department...',
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
    department: '',
    description: '',
  };

  const handleItemsChange = (newItems: Department[]) => {
    // Transform department values to uppercase with underscores
    const transformedItems = newItems.map(item => ({
      ...item,
      department: item.department.toUpperCase().replace(/\s+/g, '_'),
    }));
    setValue('items', transformedItems, { shouldValidate: true });
  };

  const handleSave = async (item: Department, index: number) => {
    console.log('handleSave called for item:', item, 'at index:', index);

    // Validate current item has required fields
    if (!item.department || !item.description) {
      console.warn('Validation failed: missing required fields');
      return;
    }

    try {
      // Check if this is an existing item (has a valid ID from server)
      const isExistingItem = item.id && item.id.trim() !== '';

      if (isExistingItem) {
        // Update existing department
        console.log('Updating department with ID:', item.id);

        const updatePayload = {
          department: item.department,
          description: item.description,
          updatedAt: new Date().toISOString(),
        };

        console.log('Calling updateDepartment with payload:', updatePayload);

        const result = await updateDepartment(item.id, updatePayload);

        console.log('API result:', result);

        if (result) {
          // Update the item with any returned data
          const updatedItems = [...items];
          updatedItems[index] = result;
          setValue('items', updatedItems);
          console.log('Item updated successfully:', result);
        }
      } else {
        // Create new department
        const itemId = `DEPT_${Date.now()}`;

        console.log('Creating department with ID:', itemId);

        const carrier: DepartmentCarrier = {
          id: itemId,
          department: item.department,
          description: item.description,
          createdAt: new Date().toISOString(),
        };

        console.log('Calling createDepartment with carrier:', carrier);

        const result = await createDepartment(carrier);

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
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async (item: Department, index: number) => {
    console.log('handleDelete called for item:', item, 'at index:', index);

    try {
      if (!item.id || item.id.trim() === '') {
        console.warn('Cannot delete item without ID');
        return;
      }

      const success = await deleteDepartment(item.id);

      if (success) {
        // Remove the item from the form state
        const updatedItems = items.filter((_: any, i: number) => i !== index);
        setValue('items', updatedItems, { shouldValidate: true });
        console.log('Department deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  return (
    <Form {...form}>
      <form>
        {/* Centered Container - Full width on mobile, constrained on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading departments...</p>
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
