/**
 * Work Locations Tab
 * Manage office locations and remote work settings
 */

import { useState } from 'react';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { WorkLocation } from '../../types/settings.types';

export function WorkLocationsTab() {
  const [items, setItems] = useState<WorkLocation[]>([
    { id: 'bangalore', description: 'Bangalore' },
    { id: 'hyderabad', description: 'Hyderabad' },
    { id: 'pune', description: 'Pune' },
    { id: 'mumbai', description: 'Mumbai' },
    { id: 'remote', description: 'Remote' },
  ]);

  const columns: TableColumn<WorkLocation>[] = [
    {
      key: 'id',
      header: 'ID',
      type: 'text',
      required: true,
      placeholder: 'Enter unique location ID...',
      width: '200px',
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Work Locations</h2>
        <p className="text-muted-foreground mt-1">
          Manage office locations, branches, and remote work configurations
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
