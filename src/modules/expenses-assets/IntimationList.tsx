/**
 * Intimation List Component
 * List view with tabs for different intimation states
 * Integrates with API using context
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenericToolbar } from '@/components/GenericToolbar';
import { IntimationTable } from './components/IntimationTable';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

export function IntimationList() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Column visibility configuration
  const allColumns = [
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'employeeName', label: 'Name' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'type', label: 'Type' },
    { id: 'description', label: 'Description' },
    { id: 'estimatedTotalCost', label: 'Est. Cost' },
    { id: 'submittedAt', label: 'Submitted Date' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map(col => col.id)
  );

  // Filter fields
  const filterFields: AvailableFilter[] = [
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Travel', value: 'travel' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      id: 'dateFrom',
      label: 'From Date',
      type: 'date',
    },
    {
      id: 'dateTo',
      label: 'To Date',
      type: 'date',
    },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="submitted">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <GenericToolbar
            showSearch={true}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search intimations..."
            showFilters={true}
            availableFilters={filterFields}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport={true}
            onExportAll={() => console.log('Export all')}
            showConfigureView={true}
            allColumns={allColumns}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
          />

          <div className="mt-4">
            <IntimationTable 
              activeTab={activeTab}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
              visibleColumns={visibleColumns}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
