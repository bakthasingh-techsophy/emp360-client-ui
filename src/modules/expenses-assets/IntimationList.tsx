/**
 * Intimation List Component
 * List view with tabs for different intimation states
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenericToolbar } from '@/components/GenericToolbar';
import { IntimationTable } from './components/IntimationTable';
import { mockIntimations } from './data/mockData';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

export function IntimationList() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Column visibility configuration
  const allColumns = [
    { id: 'intimationNumber', label: 'Intimation #' },
    { id: 'type', label: 'Type' },
    { id: 'journey', label: 'Journey/Description' },
    { id: 'estimatedTotalCost', label: 'Est. Cost' },
    { id: 'submittedAt', label: 'Submitted Date' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map(col => col.id)
  );

  // Filter intimations by tab
  const allIntimations = mockIntimations;
  const draftIntimations = allIntimations.filter(i => i.status === 'draft');
  const submittedIntimations = allIntimations.filter(i => i.status === 'submitted' || i.status === 'pending_approval');
  const approvedIntimations = allIntimations.filter(i => i.status === 'approved');
  const rejectedIntimations = allIntimations.filter(i => i.status === 'rejected');
  const acknowledgedIntimations = allIntimations.filter(i => i.status === 'acknowledged');
  const cancelledIntimations = allIntimations.filter(i => i.status === 'cancelled');

  // Get current tab intimations
  const getCurrentIntimations = () => {
    switch (activeTab) {
      case 'draft': return draftIntimations;
      case 'submitted': return submittedIntimations;
      case 'approved': return approvedIntimations;
      case 'rejected': return rejectedIntimations;
      case 'acknowledged': return acknowledgedIntimations;
      case 'cancelled': return cancelledIntimations;
      default: return allIntimations;
    }
  };

  const currentIntimations = getCurrentIntimations();

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
          <TabsTrigger value="all">All ({allIntimations.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftIntimations.length})</TabsTrigger>
          <TabsTrigger value="submitted">Pending ({submittedIntimations.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedIntimations.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedIntimations.length})</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged ({acknowledgedIntimations.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledIntimations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <GenericToolbar
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
              data={currentIntimations} 
              loading={false}
              visibleColumns={visibleColumns}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
