/**
 * Departments Tab
 * Manage organizational departments
 */

import { useState } from 'react';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Department } from '../../types/settings.types';

export function DepartmentsTab() {
  const [items, setItems] = useState<Department[]>([
    { id: 'engineering', description: 'Engineering' },
    { id: 'human-resources', description: 'Human Resources' },
    { id: 'finance', description: 'Finance' },
    { id: 'marketing', description: 'Marketing' },
    { id: 'sales', description: 'Sales' },
    { id: 'operations', description: 'Operations' },
  ]);

  const columns: TableColumn<Department>[] = [
    {
      key: 'id',
      header: 'ID',
      type: 'text',
      required: true,
      placeholder: 'Enter unique department ID...',
      width: '250px',
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Departments</h2>
        <p className="text-muted-foreground mt-1">
          Manage departments and organizational units
        </p>
      </div>

      <EditableItemsTable
        columns={columns}
        items={items}
        onChange={setItems}
        emptyItemTemplate={emptyItem}
        minItems={1}
        maxItems={50}
        showAddButton={true}
        allowRemove={true}
        allowAdd={true}
      />
    </div>
  );
}
