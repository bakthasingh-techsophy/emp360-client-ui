/**
 * Designations Tab
 * Manage job titles and designations
 */

import { useState } from 'react';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Designation } from '../../types/settings.types';

export function DesignationsTab() {
  const [items, setItems] = useState<Designation[]>([
    { id: 'software-engineer', description: 'Software Engineer' },
    { id: 'senior-software-engineer', description: 'Senior Software Engineer' },
    { id: 'tech-lead', description: 'Tech Lead' },
    { id: 'manager', description: 'Manager' },
    { id: 'senior-manager', description: 'Senior Manager' },
  ]);

  const columns: TableColumn<Designation>[] = [
    {
      key: 'id',
      header: 'ID',
      type: 'text',
      required: true,
      placeholder: 'Enter unique designation ID...',
      width: '250px',
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Designations</h2>
        <p className="text-muted-foreground mt-1">
          Manage job titles and designations across your organization
        </p>
      </div>

      <EditableItemsTable
        columns={columns}
        items={items}
        onChange={setItems}
        emptyItemTemplate={emptyItem}
        minItems={1}
        maxItems={100}
        showAddButton={true}
        allowRemove={true}
        allowAdd={true}
      />
    </div>
  );
}
